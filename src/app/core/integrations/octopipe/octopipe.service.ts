import {
  forwardRef,
  HttpService,
  Inject,
  Injectable
} from '@nestjs/common'
import { IPipelineOptions } from '../../../api/components/interfaces'
import { AppConstants } from '../../constants'
import { IDeploymentConfiguration } from '../configuration/interfaces'
import { QueuedPipelineTypesEnum } from '../../../api/deployments/enums'
import { ConsoleLoggerService } from '../../logs/console'
import { IConsulKV } from '../consul/interfaces'
import {
  ComponentDeploymentEntity,
  ComponentUndeploymentEntity,
  DeploymentEntity,
  ModuleDeploymentEntity,
  QueuedDeploymentEntity,
  QueuedUndeploymentEntity
} from '../../../api/deployments/entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PipelineErrorHandlerService } from '../../../api/deployments/services'
import {
  ComponentDeploymentsRepository,
  ComponentUndeploymentsRepository,
  QueuedDeploymentsRepository
} from '../../../api/deployments/repository'
import { IBaseVirtualService, IEmptyVirtualService } from '../spinnaker/connector/interfaces'
import { createEmptyVirtualService, createVirtualService } from '../spinnaker/connector/utils/manifests/base-virtual-service'
import { ISpinnakerPipelineConfiguration } from '../spinnaker/interfaces'
import createDestinationRules from '../spinnaker/connector/utils/manifests/base-destination-rules'

//   {
//   "versions": [
//       {
//         "version": "darwin-ui-legacy-darwin-v-1-7-3",
//         "versionUrl": "realwavelab.azurecr.io/darwin-ui-legacy:darwin-v-1-7-3"
//     }
//   ],
//   "unused_versions": [],
//   "istio": {
//     "virtualService": {},
//     "destinationRules": {}
//   },
//   "appName": "darwin-ui-legacy",
//   "appNamespace": "octopipe2",
//   "webHookUrl": "",
//   "github": {
//     "username": "maycommit",
//     "password": "May@9271",
//     "token": ""
//   },
//   "helmUrl": "https://api.github.com/repos/zupit/darwin-k8s-chart-values/contents/"
// }

interface IOctopipeVersion {
  version: string
  versionUrl: string
}

export interface IOctopipeConfiguration {
  hosts?: string[],
  versions: IOctopipeVersion[],
  unusedVersions: IOctopipeVersion[],
  istio: {
    virtualService: {},
    destinationRules: {}
  },
  appName: string,
  appNamespace: string
  webHookUrl: string,
  github: {
    username?: string,
    password?: string,
    token?: string
  },
  helmUrl: string
}

@Injectable()
export class OctopipeService {

  constructor(
    private readonly httpService: HttpService,
    private readonly consoleLoggerService: ConsoleLoggerService,
    @Inject(AppConstants.CONSUL_PROVIDER)
    private readonly consulConfiguration: IConsulKV,
    @InjectRepository(DeploymentEntity)
    private readonly deploymentsRepository: Repository<DeploymentEntity>,
    @InjectRepository(QueuedDeploymentsRepository)
    private readonly queuedDeploymentsRepository: QueuedDeploymentsRepository,
    @InjectRepository(ComponentUndeploymentsRepository)
    private readonly componentUndeploymentsRepository: ComponentUndeploymentsRepository,
    @InjectRepository(ComponentDeploymentsRepository)
    private readonly componentDeploymentsRepository: ComponentDeploymentsRepository,
    @Inject(forwardRef(() => PipelineErrorHandlerService))
    private readonly pipelineErrorHandlingService: PipelineErrorHandlerService
  ) { }

  public async createDeployment(
    pipelineCirclesOptions: IPipelineOptions,
    deploymentConfiguration: IDeploymentConfiguration,
    componentDeploymentId: string,
    deploymentId: string,
    circleId: string,
    pipelineCallbackUrl: string,
    queueId: number
  ): Promise<void> {

    const componentDeploymentEntity: ComponentDeploymentEntity =
      await this.componentDeploymentsRepository.getOneWithRelations(componentDeploymentId)
    const payload: IOctopipeConfiguration =
      this.createPipelineConfigurationObject(
        pipelineCirclesOptions, deploymentConfiguration, circleId, pipelineCallbackUrl, componentDeploymentEntity.moduleDeployment
      )

    const spinnakerPipelineConfiguration: ISpinnakerPipelineConfiguration =
      this.createSpinnakerConfiguration(
        pipelineCirclesOptions, deploymentConfiguration, circleId, pipelineCallbackUrl, componentDeploymentEntity.moduleDeployment
      )
    // decidir rota, fazer post com payload da configuration
    payload.istio.virtualService = this.buildVirtualServices(spinnakerPipelineConfiguration)
    payload.istio.destinationRules = this.buildDestinationRules(spinnakerPipelineConfiguration)
    this.deploy(payload, deploymentId, queueId)
  }

  public async deploy(
    payload: IOctopipeConfiguration,
    deploymentId: string,
    queueId: number
  ): Promise<void> {

    try {
      this.consoleLoggerService.log(`START:DEPLOY_OCTOPIPE_PIPELINE`)
      await this.httpService.post(
        `${this.consulConfiguration.octopipeUrl}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ).toPromise()
      this.consoleLoggerService.log(`FINISH:DEPLOY_OCTOPIPE_PIPELINE`)
    } catch (error) {
      await this.handleDeploymentFailure(deploymentId, queueId)
    }
  }

  private createPipelineConfigurationObject(
    pipelineCirclesOptions: IPipelineOptions,
    deploymentConfiguration: IDeploymentConfiguration,
    circleId: string,
    pipelineCallbackUrl: string,
    moduleDeployment: ModuleDeploymentEntity
  ): IOctopipeConfiguration {

    return {
      appName: deploymentConfiguration.appName,
      appNamespace: deploymentConfiguration.appNamespace,
      github: { username: 'aaa', password: 'bbb' },
      helmUrl: moduleDeployment.helmRepository,
      istio: { virtualService: {}, destinationRules: {} }, // buscar do compiler de virtualservice
      unusedVersions: pipelineCirclesOptions.pipelineUnusedVersions,
      versions: pipelineCirclesOptions.pipelineVersions,
      webHookUrl: pipelineCallbackUrl
    }
  }

  private createSpinnakerConfiguration( // remover mistura de interfaces, só pra fazer a POC mesmo
    pipelineCirclesOptions: IPipelineOptions,
    deploymentConfiguration: IDeploymentConfiguration,
    circleId: string,
    pipelineCallbackUrl: string,
    moduleDeployment: ModuleDeploymentEntity
  ): ISpinnakerPipelineConfiguration {

    return {
      ...deploymentConfiguration,
      webhookUri: pipelineCallbackUrl,
      versions: pipelineCirclesOptions.pipelineVersions,
      unusedVersions: pipelineCirclesOptions.pipelineUnusedVersions,
      circles: pipelineCirclesOptions.pipelineCircles,
      githubAccount: this.consulConfiguration.spinnakerGithubAccount,
      helmRepository: moduleDeployment.helmRepository,
      circleId
    }
  }

  private async handleDeploymentFailure(deploymentId: string, queueId: number): Promise<void> {
    this.consoleLoggerService.error(`ERROR:DEPLOY_OCTOPIPE_PIPELINE ${deploymentId} ${queueId}`)
    const queuedDeployment: QueuedDeploymentEntity = await this.queuedDeploymentsRepository.findOne({ id: queueId })

    if (queuedDeployment.type === QueuedPipelineTypesEnum.QueuedDeploymentEntity) {
      await this.handleQueuedDeploymentFailure(queuedDeployment, deploymentId)
    } else {
      await this.handleQueuedUndeploymentFailure(queuedDeployment as QueuedUndeploymentEntity)
    }
  }

  private async handleQueuedDeploymentFailure(queuedDeployment: QueuedDeploymentEntity, deploymentId: string): Promise<void> {
    const deployment: DeploymentEntity = await this.deploymentsRepository.findOne({ id: deploymentId })
    const componentDeployment: ComponentDeploymentEntity =
      await this.componentDeploymentsRepository.findOne({ id: queuedDeployment.componentDeploymentId })

    await this.pipelineErrorHandlingService.handleComponentDeploymentFailure(componentDeployment, queuedDeployment, deployment.circle)
    await this.pipelineErrorHandlingService.handleDeploymentFailure(deployment)
  }

  private async handleQueuedUndeploymentFailure(queuedUndeployment: QueuedUndeploymentEntity): Promise<void> {
    const componentUndeployment: ComponentUndeploymentEntity =
      await this.componentUndeploymentsRepository.getOneWithRelations(queuedUndeployment.componentUndeploymentId)
    const componentDeployment: ComponentDeploymentEntity =
      await this.componentDeploymentsRepository.getOneWithRelations(queuedUndeployment.componentDeploymentId)
    const { moduleUndeployment: { undeployment } } = componentUndeployment

    await this.pipelineErrorHandlingService.handleComponentUndeploymentFailure(componentDeployment, queuedUndeployment)
    await this.pipelineErrorHandlingService.handleUndeploymentFailure(undeployment)
  }

  private buildVirtualServices(contract: ISpinnakerPipelineConfiguration) {
    const virtualService: IBaseVirtualService | IEmptyVirtualService =
      contract.versions.length === 0
        ? createEmptyVirtualService(contract.appName, contract.appNamespace)
        : createVirtualService(contract)
    return virtualService
  }

  private buildDestinationRules(contract: ISpinnakerPipelineConfiguration) {
    return createDestinationRules(contract)
  }

  // private getCreateSpinnakerApplicationObject(applicationName: string): ICreateSpinnakerApplication {
  //   return {
  //     job: [{
  //       type: AppConstants.SPINNAKER_CREATE_APPLICATION_JOB_TYPE,
  //       application: {
  //         cloudProviders: AppConstants.SPINNAKER_CREATE_APPLICATION_DEFAULT_CLOUD,
  //         instancePort: AppConstants.SPINNAKER_CREATE_APPLICATION_PORT,
  //         name: applicationName,
  //         email: AppConstants.SPINNAKER_CREATE_APPLICATION_DEFAULT_EMAIL
  //       }
  //     }],
  //     application: applicationName
  //   }
  // }
}
