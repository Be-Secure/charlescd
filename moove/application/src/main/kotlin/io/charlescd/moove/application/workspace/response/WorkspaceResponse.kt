/*
 *
 *  * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package io.charlescd.moove.application.workspace.response

import com.fasterxml.jackson.annotation.JsonFormat
import io.charlescd.moove.application.configuration.response.MetricConfigurationResponse
import io.charlescd.moove.application.usergroup.response.UserGroupResponse
import io.charlescd.moove.domain.*
import java.time.LocalDateTime

data class WorkspaceResponse(
    val id: String,
    val name: String,
    val status: String,
    val authorId: String,
    val authorEmail: String,
    val gitConfiguration: GitConfigurationResponse? = null,
    val registryConfiguration: RegistryConfigurationResponse? = null,
    val cdConfiguration: CdConfigurationResponse? = null,
    val circleMatcherUrl: String? = null,
    val metricConfiguration: MetricConfigurationResponse? = null,
    val webhookConfiguration: List<WebhookConfigurationResponse>,
    val userGroups: List<UserGroupResponse>,
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    val createdAt: LocalDateTime
) {
    companion object {

        fun from(
            workspace: Workspace,
            gitConfiguration: GitConfiguration? = null,
            registryConfigurationName: String? = null,
            cdConfiguration: CdConfiguration? = null,
            metricConfiguration: MetricConfiguration? = null,
            webhookConfiguration: List<WebhookConfiguration> = emptyList()
        ): WorkspaceResponse {
            return WorkspaceResponse(
                id = workspace.id,
                name = workspace.name,
                status = workspace.status.name,
                authorId = workspace.author.id,
                authorEmail = workspace.author.email,
                userGroups = workspace.userGroups.map { UserGroupResponse.from(it) },
                createdAt = workspace.createdAt,
                gitConfiguration = gitConfiguration?.let {
                    GitConfigurationResponse(
                        id = gitConfiguration.id,
                        name = gitConfiguration.name
                    )
                },
                circleMatcherUrl = workspace.circleMatcherUrl,
                registryConfiguration = registryConfigurationName?.let {
                    RegistryConfigurationResponse(
                        id = workspace.registryConfigurationId!!,
                        name = registryConfigurationName
                    )
                },
                cdConfiguration = cdConfiguration?.let {
                    CdConfigurationResponse(
                        id = it.id,
                        name = it.name
                    )
                },
                metricConfiguration = metricConfiguration?.let {
                    MetricConfigurationResponse(
                        id = it.id,
                        provider = it.provider.name
                    )
                },
                webhookConfiguration = webhookConfiguration.map {
                    WebhookConfigurationResponse(
                        id = it.id,
                        description = it.description,
                        url = it.url,
                        workspaceId = it.workspaceId,
                        events = it.events,
                        lastDelivery = WebhookLastDeliveryResponse(
                            status = it.lastDelivery.status,
                            details = it.lastDelivery.details
                        )
                    )
                }
            )
        }
    }

    data class GitConfigurationResponse(
        val name: String,
        val id: String
    )

    data class RegistryConfigurationResponse(
        val name: String,
        val id: String
    )

    data class CdConfigurationResponse(
        val name: String,
        val id: String
    )

    data class WebhookConfigurationResponse(
        val id: String,
        val description: String,
        val url: String,
        val workspaceId: String,
        val events: List<String>,
        val lastDelivery: WebhookLastDeliveryResponse
    )

    data class WebhookLastDeliveryResponse(
        val status: Long,
        val details: String
    )
}
