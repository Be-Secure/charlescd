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

package io.charlescd.moove.api.controller

import io.charlescd.moove.application.webhook.*
import io.charlescd.moove.application.webhook.request.CreateWebhookSubscriptionRequest
import io.charlescd.moove.application.webhook.request.UpdateWebhookSubscriptionRequest
import io.charlescd.moove.application.webhook.response.CreateWebhookSubscriptionResponse
import io.charlescd.moove.application.webhook.response.SimpleWebhookSubscriptionResponse
import io.swagger.annotations.ApiOperation
import javax.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/webhooks")
class WebhookController(
    private val createWebhookSubscriptionInteractor: CreateWebhookSubscriptionInteractor,
    private val updateWebhookSubscriptionInteractor: UpdateWebhookSubscriptionInteractor,
    private val getWebhookSubscriptionInteractor: GetWebhookSubscriptionInteractor,
    private val deleteWebhookSubscriptionInteractor: DeleteWebhookSubscriptionInteractor,
    private val healthCheckWebhookSubscriptionInteractor: HealthCheckWebhookSubscriptionInteractor
) {

    @ApiOperation(value = "Create a subscribe webhook")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun subscribe(
        @RequestHeader("x-workspace-id") workspaceId: String,
        @RequestHeader(value = "Authorization") authorization: String,
        @Valid @RequestBody request: CreateWebhookSubscriptionRequest
    ): CreateWebhookSubscriptionResponse {
        return createWebhookSubscriptionInteractor.execute(workspaceId, authorization, request)
    }

    @ApiOperation(value = "Get a subscription webhook")
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun getSubscription(
        @RequestHeader("x-workspace-id") workspaceId: String,
        @RequestHeader(value = "Authorization") authorization: String,
        @PathVariable("id") id: String
    ): SimpleWebhookSubscriptionResponse {
        return getWebhookSubscriptionInteractor.execute(workspaceId, authorization, id)
    }

    @ApiOperation(value = "Update a subscription webhook")
    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun updateSubscription(
        @RequestHeader("x-workspace-id") workspaceId: String,
        @RequestHeader(value = "Authorization") authorization: String,
        @PathVariable("id") id: String,
        @Valid @RequestBody request: UpdateWebhookSubscriptionRequest
    ): SimpleWebhookSubscriptionResponse {
        return updateWebhookSubscriptionInteractor.execute(workspaceId, authorization, id, request)
    }

    @ApiOperation(value = "Delete a subscription webhook")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun deleteSubscription(
        @RequestHeader("x-workspace-id") workspaceId: String,
        @RequestHeader(value = "Authorization") authorization: String,
        @PathVariable("id") id: String
    ) {
        deleteWebhookSubscriptionInteractor.execute(workspaceId, authorization, id)
    }

    @ApiOperation(value = "Health check from a subscription webhook")
    @DeleteMapping("/{id}/health-check")
    @ResponseStatus(HttpStatus.OK)
    fun healthCheck(
        @RequestHeader("x-workspace-id") workspaceId: String,
        @RequestHeader(value = "Authorization") authorization: String,
        @PathVariable("id") id: String
    ) {
        healthCheckWebhookSubscriptionInteractor.execute(workspaceId, authorization, id)
    }
}
