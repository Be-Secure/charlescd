/*
 * Copyright 2020, 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
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

package io.charlescd.moove.infrastructure.configuration

import feign.Retryer
import feign.codec.ErrorDecoder
import org.springframework.beans.factory.ObjectFactory
import org.springframework.boot.autoconfigure.http.HttpMessageConverters
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class HermesPublisherEncoderConfiguration(
    val messageConverters: ObjectFactory<HttpMessageConverters>
) {

    @Bean
    fun hermesPublisherRetryer(): Retryer {
        return Retryer.Default(5, 30, 5) // TODO: Colocar em properties???
    }

    @Bean
    fun hermesPublisherErrorDecoder(): ErrorDecoder {
        return CustomFeignErrorDecoder()
    }
}
