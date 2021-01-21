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

package io.charlescd.moove.infrastructure.service

import io.charlescd.moove.domain.*
import io.charlescd.moove.infrastructure.service.client.HermesClient
import io.charlescd.moove.infrastructure.service.client.HermesPublisherClient
import io.charlescd.moove.infrastructure.service.client.request.HermesCreateSubscriptionRequest
import io.charlescd.moove.infrastructure.service.client.request.HermesUpdateSubscriptionRequest
import io.charlescd.moove.infrastructure.service.client.response.HermesSubscriptionCreateResponse
import io.charlescd.moove.infrastructure.service.client.response.HermesSubscriptionResponse
import spock.lang.Specification

class HermesClientServiceTest extends Specification {

    private HermesClientService hermesService
    private HermesClient hermesClient = Mock(HermesClient)
    private HermesPublisherClient hermesPublisherClient = Mock(HermesPublisherClient)

    def setup() {
        hermesService = new HermesClientService(hermesClient, hermesPublisherClient)
    }

    def 'when creating a subscription, should do it successfully'() {
        given:
        def request = new HermesCreateSubscriptionRequest('https://mywebhook.com.br', 'secret', 'workspaceId',
                'My Webhook', events)
        def subscription = new WebhookSubscription('https://mywebhook.com.br', 'secret', 'workspaceId',
                'My Webhook', events)
        def response = new HermesSubscriptionCreateResponse("subscriptionId")

        when:
        hermesService.subscribe(authorEmail, subscription)

        then:
        1 * hermesClient.subscribe(authorEmail, request) >> response

    }

    def 'when getting a subscription, should do it successfully'() {

        when:
        hermesService.getSubscription(authorEmail, "subscriptionId")

        then:
        1 * hermesClient.getSubscription(authorEmail, "subscriptionId") >> hermesSubscriptionResponse

    }

    def 'when update a subscription, should do it successfully'() {
        given:
        def request = new HermesUpdateSubscriptionRequest(events)

        when:
        hermesService.updateSubscription(authorEmail, "subscriptionId", events)

        then:
        1 * hermesClient.updateSubscription(authorEmail, "subscriptionId", request) >> hermesSubscriptionResponse

    }

    def 'when delete a subscription, should do it successfully'() {

        when:
        hermesService.deleteSubscription(authorEmail, "subscriptionId")

        then:
        1 * hermesClient.deleteSubscription(authorEmail, "subscriptionId")

    }

    private static String getAuthorEmail() {
        return "email@email.com"
    }

    private static HermesSubscriptionResponse getHermesSubscriptionResponse() {
        return new HermesSubscriptionResponse('https://mywebhook.com.br', 'secret', 'workspaceId',
                'My Webhook', events)
    }

    private static List<String> getEvents() {
        def events = new ArrayList()
        events.add("DEPLOY")
        return events
    }
}
