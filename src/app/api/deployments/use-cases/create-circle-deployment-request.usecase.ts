import {
    Inject,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
    ComponentDeploymentEntity,
    DeploymentEntity,
    ModuleDeploymentEntity,
    QueuedDeploymentEntity
} from '../entity'
import { Repository } from 'typeorm'
import {
    CreateCircleDeploymentRequestDto,
    ReadDeploymentDto
} from '../dto'
import { ConsoleLoggerService } from '../../../core/logs/console'
import { QueuedPipelineStatusEnum } from '../enums'
import { ModuleEntity } from '../../modules/entity'
import { ComponentEntity } from '../../components/entity'
import {
    PipelineDeploymentsService,
    PipelineErrorHandlingService,
    PipelineQueuesService
} from '../services'
import { QueuedDeploymentsRepository } from '../repository'
import { AppConstants } from '../../../core/constants'
import { IConsulKV } from '../../../core/integrations/consul/interfaces'

@Injectable()
export class CreateCircleDeploymentRequestUsecase {

    constructor(
        @InjectRepository(DeploymentEntity)
        private readonly deploymentsRepository: Repository<DeploymentEntity>,
        @InjectRepository(ModuleEntity)
        private readonly modulesRepository: Repository<ModuleEntity>,
        @InjectRepository(ComponentEntity)
        private readonly componentsRepository: Repository<ComponentEntity>,
        @InjectRepository(QueuedDeploymentsRepository)
        private readonly queuedDeploymentsRepository: QueuedDeploymentsRepository,
        private readonly consoleLoggerService: ConsoleLoggerService,
        private readonly pipelineQueuesService: PipelineQueuesService,
        private readonly pipelineDeploymentsService: PipelineDeploymentsService,
        private readonly pipelineErrorHandlingService: PipelineErrorHandlingService
    ) {}

    public async execute(createCircleDeploymentRequestDto: CreateCircleDeploymentRequestDto, circleId: string): Promise<ReadDeploymentDto> {
        let deployment: DeploymentEntity

        try {
            deployment = await this.persistDeploymentEntity(createCircleDeploymentRequestDto, circleId)
            await this.persistModulesAndComponentEntities(deployment)
            await this.scheduleComponentDeployments(deployment)
            return deployment.toReadDto()
        } catch (error) {
            await this.pipelineErrorHandlingService.handleDeploymentFailure(deployment)
            throw error
        }
    }

    private async persistDeploymentEntity(
        createCircleDeploymentRequestDto: CreateCircleDeploymentRequestDto,
        circleId: string
    ): Promise<DeploymentEntity> {

        try {
            return await this.deploymentsRepository.save(createCircleDeploymentRequestDto.toEntity(circleId))
        } catch (error) {
            throw new InternalServerErrorException('Could not save deployment')
        }
    }

    private async persistModulesAndComponentEntities(deployment: DeploymentEntity): Promise<void> {
        try {
            await Promise.all(
                deployment.modules
                    .map(moduleDeployment => this.saveModuleEntities(moduleDeployment))
            )
        } catch (error) {
            throw new InternalServerErrorException('Could not save modules')
        }
    }

    private async saveModuleEntities(moduleDeployment: ModuleDeploymentEntity): Promise<void> {
        let moduleEntity: ModuleEntity

        moduleEntity = await this.modulesRepository.findOne({ id: moduleDeployment.moduleId })
        if (!moduleEntity) {
            moduleEntity = await this.modulesRepository.save(
                new ModuleEntity(moduleDeployment.moduleId, [])
            )
        }
        await this.persistComponentsEntities(moduleDeployment, moduleEntity)
    }

    private async persistComponentsEntities(moduleDeployment: ModuleDeploymentEntity, moduleEntity: ModuleEntity): Promise<void> {
        try {
            await Promise.all(
                moduleDeployment.components
                    .map(componentDeployment => this.saveComponentEntity(componentDeployment, moduleEntity))
            )
        } catch (error) {
            throw new InternalServerErrorException('Could not save components')
        }
    }

    private async saveComponentEntity(componentDeployment: ComponentDeploymentEntity, module: ModuleEntity): Promise<ComponentEntity> {
        const componentEntity: ComponentEntity =
            await this.componentsRepository.findOne({ id: componentDeployment.componentId })

        if (!componentEntity) {
            return await this.componentsRepository.save(
                new ComponentEntity(componentDeployment.componentId, module)
            )
        }
    }

    private async scheduleComponentDeployments(deployment: DeploymentEntity): Promise<void> {
        try {
            const componentDeployments: ComponentDeploymentEntity[] = deployment.getComponentDeployments()
            await Promise.all(
                componentDeployments.map(
                    componentDeployment => this.enqueueComponentDeployment(deployment, componentDeployment)
                )
            )
        } catch (error) {
            throw error
        }
    }

    private async enqueueComponentDeployment(
        deployment: DeploymentEntity,
        componentDeployment: ComponentDeploymentEntity
    ): Promise<void> {

        let queuedDeployment: QueuedDeploymentEntity

        try {
            queuedDeployment = await this.persistQueuedDeployment(componentDeployment)
            const component: ComponentEntity = await this.componentsRepository.findOne({ id: componentDeployment.componentId })
            if (queuedDeployment.status === QueuedPipelineStatusEnum.RUNNING) {
                await this.pipelineDeploymentsService.triggerCircleDeployment(componentDeployment, component, deployment, queuedDeployment)
            }
        } catch (error) {
            throw error
        }
    }

    private async persistQueuedDeployment(componentDeployment: ComponentDeploymentEntity): Promise<QueuedDeploymentEntity> {
        try {
            const status: QueuedPipelineStatusEnum =
                await this.pipelineQueuesService.getQueuedPipelineStatus(componentDeployment.componentId)

            return await this.queuedDeploymentsRepository.save(
                new QueuedDeploymentEntity(componentDeployment.componentId, componentDeployment.id, status)
            )
        } catch (error) {
            throw new InternalServerErrorException('Could not save queued deployment')
        }
    }
}
