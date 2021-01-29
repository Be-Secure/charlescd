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

package io.charlescd.moove.application.user.impl

import io.charlescd.moove.application.UserService
import io.charlescd.moove.application.user.FindUserByEmailInteractor
import io.charlescd.moove.application.user.response.SimpleUserResponse
import java.util.*
import javax.inject.Named

@Named
class FindUserByEmailInteractorImpl(private val userService: UserService) : FindUserByEmailInteractor {

    override fun execute(email: String, authorization: String): SimpleUserResponse {
        val user = userService.findByAuthorizationToken(authorization)
        if (user.root) {
            return getUser(String(Base64.getDecoder().decode(email)).toLowerCase().trim())
        }
        return getUser(user.email)
    }

    private fun getUser(email: String): SimpleUserResponse {
        return SimpleUserResponse.from(
            userService.findByEmail(email)
        )
    }
}
