/*
 *
 *  Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package api

import (
	"fmt"
	"github.com/gorilla/mux"
	"hermes/web/api/subscription"
)

func (api *Api) newV1Api(s *mux.Router) {
	r := s.PathPrefix("/v1").Subrouter()
	{
		path := "/subscriptions"
		r.HandleFunc(path, subscription.Create(api.subscriptionMain)).Methods("POST")
		r.HandleFunc(fmt.Sprintf("%s/{subscriptionId}", path), subscription.Update(api.subscriptionMain)).Methods("PATCH")
		r.HandleFunc(fmt.Sprintf("%s/{subscriptionId}", path), subscription.Delete(api.subscriptionMain)).Methods("DELETE")
		r.HandleFunc(fmt.Sprintf("%s/{subscriptionId}", path), subscription.FindById(api.subscriptionMain)).Methods("GET")
	}
}
