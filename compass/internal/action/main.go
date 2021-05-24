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

package action

import (
	"gorm.io/gorm"
	"io"

	"github.com/ZupIT/charlescd/compass/internal/plugin"
	"github.com/ZupIT/charlescd/compass/pkg/errors"
	"github.com/google/uuid"
)

type UseCases interface {
	ValidateAction(action Request) errors.ErrorList
	ParseAction(action io.ReadCloser) (Request, errors.Error)
	FindActionByIdAndWorkspace(id, workspaceID uuid.UUID) (Response, errors.Error)
	FindActionById(id string) (Response, errors.Error)
	FindAllActionsByWorkspace(workspaceID uuid.UUID) ([]Response, errors.Error)
	SaveAction(action Request) (Response, errors.Error)
	DeleteAction(id string) errors.Error
}

type Main struct {
	db         *gorm.DB
	pluginRepo plugin.UseCases
}

func NewMain(db *gorm.DB, pluginRepo plugin.UseCases) UseCases {
	return Main{db, pluginRepo}
}
