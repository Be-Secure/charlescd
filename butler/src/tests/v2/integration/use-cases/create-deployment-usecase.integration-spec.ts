/*
 * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import { EntityManager } from 'typeorm'
import { AppModule } from '../../../../app/app.module'
import { ComponentEntityV2 as ComponentEntity } from '../../../../app/v2/api/deployments/entity/component.entity'
import { DeploymentEntityV2 as DeploymentEntity } from '../../../../app/v2/api/deployments/entity/deployment.entity'
import { GitProvidersEnum } from '../../../../app/v2/core/configuration/interfaces/git-providers.type'
import { customManifests } from '../../fixtures/manifests.fixture'
import { FixtureUtilsService } from '../fixture-utils.service'
import { UrlConstants } from '../test-constants'
import { TestSetupUtils } from '../test-setup-utils'
import { GitHubRepository } from '../../../../app/v2/core/integrations/github/github-repository'

describe('CreateDeploymentUsecase v2', () => {
  let fixtureUtilsService: FixtureUtilsService
  let app: INestApplication
  let manager: EntityManager

  beforeAll(async() => {
    const module = Test.createTestingModule({
      imports: [
        await AppModule.forRootAsync()
      ],
      providers: [
        FixtureUtilsService
      ]
    })
    app = await TestSetupUtils.createApplication(module)

    TestSetupUtils.seApplicationConstants()
    fixtureUtilsService = app.get<FixtureUtilsService>(FixtureUtilsService)
    manager = fixtureUtilsService.connection.manager
  })

  afterAll(async() => {
    await fixtureUtilsService.clearDatabase()
    await app.close()
  })

  beforeEach(async() => {
    await fixtureUtilsService.clearDatabase()
  })

  it('should only merge default circle components from the previous deployment entity of that circle', async() => {
    const encryptedToken = `-----BEGIN PGP MESSAGE-----

ww0ECQMCcRYScW+NJZZy0kUBbjTidEUAU0cTcHycJ5Phx74jvSTZ7ZE7hxK9AejbNDe5jDRGbqSd
BSAwlmwpOpK27k2yXj4g1x2VaF9GGl//Ere+xUY=
=QGZf
-----END PGP MESSAGE-----
`
    const base64Token = Buffer.from(encryptedToken).toString('base64')
    const createDeploymentRequest = {
      deploymentId: '28a3f957-3702-4c4e-8d92-015939f39cf2',
      circle: {
        id: '333365f8-bb29-49f7-bf2b-3ec956a71583',
        default: true
      },
      git: {
        token: base64Token,
        provider: GitProvidersEnum.GITHUB
      },
      components: [
        {
          helmRepository: UrlConstants.helmRepository,
          componentId: '777765f8-bb29-49f7-bf2b-3ec956a71583',
          buildImageUrl: 'imageurl.com',
          buildImageTag: 'v2',
          componentName: 'A'
        }
      ],
      authorId: '580a7726-a274-4fc3-9ec1-44e3563d58af',
      callbackUrl: UrlConstants.deploymentCallbackUrl,
      namespace: 'my-namespace',
      timeoutInSeconds: 10,
      overrideCircle: false
    }

    const component1 = new ComponentEntity(
      UrlConstants.helmRepository,
      'v2',
      'imageurl.com',
      'A',
      '777765f8-bb29-49f7-bf2b-3ec956a71583',
      null,
      null,
      customManifests('A', 'my-namespace', 'imageurl.com')
    )
    component1.running = false
    component1.id = expect.anything()
    component1.merged = false
    const component2 = new ComponentEntity(
      UrlConstants.helmRepository,
      'v1',
      'https://repository.com/B:v1',
      'B',
      '1c29210c-e313-4447-80e3-db89b2359138',
      null,
      null,
      customManifests('B', 'my-namespace', 'imageurl.com')
    )
    component2.running = false
    component2.id = expect.anything()
    component2.merged = true

    const expectedDeploymentComponents = [
      component1,
      component2
    ]

    const sameCircleActiveDeployment: DeploymentEntity = new DeploymentEntity(
      'baa226a2-97f1-4e1b-b05a-d758839408f9',
      'user-1',
      '333365f8-bb29-49f7-bf2b-3ec956a71583',
      'http://localhost:1234/notifications/deployment?deploymentId=1',
      [
        new ComponentEntity(
          UrlConstants.helmRepository,
          'v1',
          'https://repository.com/A:v1',
          'A',
          'f1c95177-438c-4c4f-94fd-c207e8d2eb61',
          null,
          null,
          customManifests('A', 'my-namespace', 'imageurl.com')
        ),
        new ComponentEntity(
          UrlConstants.helmRepository,
          'v1',
          'https://repository.com/B:v1',
          'B',
          '1c29210c-e313-4447-80e3-db89b2359138',
          null,
          null,
          customManifests('B', 'my-namespace', 'imageurl.com')
        )
      ],
      true,
      'my-namespace',
      60
    )
    sameCircleActiveDeployment.current = true

    const diffCircleActiveDeployment: DeploymentEntity = new DeploymentEntity(
      'd63ef13f-6138-41ca-ac64-6f5c25eb89f2',
      'user-1',
      '22220857-a638-4a4a-b513-63e3ef6f9d54',
      'http://localhost:1234/notifications/deployment?deploymentId=1',
      [
        new ComponentEntity(
          UrlConstants.helmRepository,
          'v1',
          'https://repository.com/C:v1',
          'C',
          '46b83994-bfae-4f1e-84cd-0d18b59735bc',
          null,
          null,
          customManifests('C', 'my-namespace', 'imageurl.com')
        ),
        new ComponentEntity(
          UrlConstants.helmRepository,
          'v1',
          'https://repository.com/D:v1',
          'D',
          '5ff6c5f3-fca5-440a-aaf5-ab3c25fdf0f5',
          null,
          null,
          customManifests('D', 'my-namespace', 'imageurl.com')
        )
      ],
      true,
      'my-namespace',
      60
    )
    diffCircleActiveDeployment.current = true

    const normalCircleActiveDeployment: DeploymentEntity = new DeploymentEntity(
      '2ba59bb7-842a-43e7-b2c8-85f35d62781b',
      'user-1',
      'fcd22a4e-c192-4c86-bca2-f23de7b73757',
      'http://localhost:1234/notifications/deployment?deploymentId=1',
      [
        new ComponentEntity(
          UrlConstants.helmRepository,
          'v1',
          'https://repository.com/E:v1',
          'E',
          '222cd8db-3767-45d5-a415-7cca09cccf91',
          null,
          null,
          customManifests('E', 'my-namespace', 'imageurl.com')
        ),
        new ComponentEntity(
          UrlConstants.helmRepository,
          'v1',
          'https://repository.com/F:v1',
          'F',
          '32f24614-ecee-4ff5-aae4-2ebd7bb85c56',
          null,
          null,
          customManifests('F', 'my-namespace', 'imageurl.com')
        )
      ],
      false,
      'my-namespace',
      60
    )
    normalCircleActiveDeployment.current = true

    await manager.save(sameCircleActiveDeployment)
    await manager.save(diffCircleActiveDeployment)
    await manager.save(normalCircleActiveDeployment)

    await request(app.getHttpServer())
      .post('/v2/deployments')
      .send(createDeploymentRequest)
      .set('x-circle-id', 'a45fd548-0082-4021-ba80-a50703c44a3b')
      .expect(201)

    const newDeployment =
      await manager.findOneOrFail(DeploymentEntity, { relations: ['components'], where: { id: createDeploymentRequest.deploymentId } })

    expect(newDeployment.components).toEqual(expectedDeploymentComponents)
  })
    
  it('when is a incremental deployment should concat the correct previous deployment components', async() => {
    const encryptedToken = `-----BEGIN PGP MESSAGE-----

ww0ECQMCcRYScW+NJZZy0kUBbjTidEUAU0cTcHycJ5Phx74jvSTZ7ZE7hxK9AejbNDe5jDRGbqSd
BSAwlmwpOpK27k2yXj4g1x2VaF9GGl//Ere+xUY=
=QGZf
-----END PGP MESSAGE-----
`
    const base64Token = Buffer.from(encryptedToken).toString('base64')
    const previousComponentA = new ComponentEntity(
      UrlConstants.helmRepository,
      'v1',
      'https://repository.com/A:v1',
      'A',
      '222cd8db-3767-45d5-a415-7cca09cccf91',
      null,
      null,
      customManifests('A', 'my-namespace', 'imageurl.com')
    )
    const previousComponentB = new ComponentEntity(
      UrlConstants.helmRepository,
      'v1',
      'https://repository.com/B:v1',
      'B',
      '32f24614-ecee-4ff5-aae4-2ebd7bb85c56',
      null,
      null,
      customManifests('B', 'my-namespace', 'imageurl.com')
    )
    const previousComponentC = new ComponentEntity(
      UrlConstants.helmRepository,
      'v1',
      'https://repository.com/C:v1',
      'C',
      '32f24614-ecee-4ff5-aae4-2ebd7bb85c56',
      null,
      null,
      customManifests('C', 'my-namespace', 'imageurl.com')
    )
    previousComponentC.merged = true
    previousComponentB.merged = true
    const currentDeployment = new DeploymentEntity(
      '2ba59bb7-842a-43e7-b2c8-85f35d62781b',
      'user-1',
      'fcd22a4e-c192-4c86-bca2-f23de7b73757',
      'http://localhost:1234/notifications/deployment?deploymentId=1',
      [
        previousComponentA,
        previousComponentB,
        previousComponentC
      ],
      false,
      'my-namespace',
      60
    )
    currentDeployment.current = true
    await manager.save(currentDeployment)
    const actualComponentA = new ComponentEntity(
      UrlConstants.helmRepository,
      'v2',
      'https://repository.com/A:v2',
      'A',
      '32f24614-ecee-4ff5-aae4-2ebd7bb85c58',
      null,
      null,
      customManifests('A', 'my-namespace', 'https://repository.com/A:v2')
    )
    actualComponentA.running = false
    actualComponentA.id = expect.anything()
    previousComponentC.id = expect.anything()
    previousComponentB.id = expect.anything()
    const expectedComponents = [actualComponentA, previousComponentB, previousComponentC]
    const createDeploymentRequest = {
      deploymentId: '28a3f957-3702-4c4e-8d92-015939f39cf2',
      circle: {
        id: 'fcd22a4e-c192-4c86-bca2-f23de7b73757',
        default: false
      },
      git: {
        token: base64Token,
        provider: GitProvidersEnum.GITHUB
      },
      components: [
        {
          helmRepository: actualComponentA.helmUrl,
          componentId: actualComponentA.componentId,
          buildImageUrl: actualComponentA.imageUrl,
          buildImageTag: actualComponentA.imageTag,
          componentName: actualComponentA.name
        }
      ],
      authorId: '580a7726-a274-4fc3-9ec1-44e3563d58af',
      callbackUrl: UrlConstants.deploymentCallbackUrl,
      namespace: 'my-namespace',
      overrideCircle: false
    }
    await request(app.getHttpServer())
      .post('/v2/deployments')
      .send(createDeploymentRequest)
      .set('x-circle-id', 'a45fd548-0082-4021-ba80-a50703c44a3b')
      .expect(201)
    const deploymentCreated = await manager.findOneOrFail(DeploymentEntity, { relations: ['components'], where: { id: createDeploymentRequest.deploymentId } })
    expect(deploymentCreated.components).toEqual(expectedComponents)
  })

  it('when is a  deployment to override circle should override the previous deployment components', async() => {
    const encryptedToken = `-----BEGIN PGP MESSAGE-----

ww0ECQMCcRYScW+NJZZy0kUBbjTidEUAU0cTcHycJ5Phx74jvSTZ7ZE7hxK9AejbNDe5jDRGbqSd
BSAwlmwpOpK27k2yXj4g1x2VaF9GGl//Ere+xUY=
=QGZf
-----END PGP MESSAGE-----
`
    const base64Token = Buffer.from(encryptedToken).toString('base64')
    const previousComponentA = new ComponentEntity(
      UrlConstants.helmRepository,
      'v1',
      'https://repository.com/A:v1',
      'A',
      '222cd8db-3767-45d5-a415-7cca09cccf91',
      null,
      null,
      customManifests('A', 'my-namespace', 'imageurl.com')
    )
    const previousComponentB = new ComponentEntity(
      UrlConstants.helmRepository,
      'v1',
      'https://repository.com/B:v1',
      'B',
      '32f24614-ecee-4ff5-aae4-2ebd7bb85c56',
      null,
      null,
      customManifests('B', 'my-namespace', 'imageurl.com')
    )
    const previousComponentC = new ComponentEntity(
      UrlConstants.helmRepository,
      'v1',
      'https://repository.com/C:v1',
      'C',
      '32f24614-ecee-4ff5-aae4-2ebd7bb85c56',
      null,
      null,
      customManifests('C', 'my-namespace', 'imageurl.com')
    )
    const currentDeployment = new DeploymentEntity(
      '2ba59bb7-842a-43e7-b2c8-85f35d62781b',
      'user-1',
      'fcd22a4e-c192-4c86-bca2-f23de7b73757',
      'http://localhost:1234/notifications/deployment?deploymentId=1',
      [
        previousComponentA,
        previousComponentB,
        previousComponentC
      ],
      false,
      'my-namespace',
      60
    )
    currentDeployment.current = true
    await manager.save(currentDeployment)
    const actualComponentA = new ComponentEntity(
      UrlConstants.helmRepository,
      'v2',
      'https://repository.com/A:v2',
      'A',
      '32f24614-ecee-4ff5-aae4-2ebd7bb85c58',
      null,
      null,
      customManifests('A', 'my-namespace', 'https://repository.com/A:v2')
    )
    actualComponentA.running = false
    actualComponentA.id = expect.anything()

    const expectedComponents = [actualComponentA]
    const createDeploymentRequest = {
      deploymentId: '28a3f957-3702-4c4e-8d92-015939f39cf2',
      circle: {
        id: 'fcd22a4e-c192-4c86-bca2-f23de7b73757',
        default: false
      },
      git: {
        token: base64Token,
        provider: GitProvidersEnum.GITHUB
      },
      components: [
        {
          helmRepository: actualComponentA.helmUrl,
          componentId: actualComponentA.componentId,
          buildImageUrl: actualComponentA.imageUrl,
          buildImageTag: actualComponentA.imageTag,
          componentName: actualComponentA.name
        }
      ],
      authorId: '580a7726-a274-4fc3-9ec1-44e3563d58af',
      callbackUrl: UrlConstants.deploymentCallbackUrl,
      namespace: 'my-namespace',
      overrideCircle: true
    }
    await request(app.getHttpServer())
      .post('/v2/deployments')
      .send(createDeploymentRequest)
      .set('x-circle-id', 'a45fd548-0082-4021-ba80-a50703c44a3b')
      .expect(201)
    const deploymentCreated = await manager.findOneOrFail(DeploymentEntity, { relations: ['components'], where: { id: createDeploymentRequest.deploymentId } })
    expect(deploymentCreated.components).toEqual(expectedComponents)

  })
})
