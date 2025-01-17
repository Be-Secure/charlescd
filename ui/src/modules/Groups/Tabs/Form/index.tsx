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

import React, { useState, useEffect } from 'react';
import useForm from 'core/hooks/useForm';
import Text from 'core/components/Text';
import ContentIcon from 'core/components/ContentIcon';
import InputTitle from 'core/components/Form/InputTitle';
import { isRequired, maxLength } from 'core/utils/validations';
import { counter } from 'core/utils/counter';
import Icon from 'core/components/Icon';
import map from 'lodash/map';
import { UserGroup } from '../../interfaces/UserGroups';
import Styled from './styled';

interface Props {
  userGroup: UserGroup;
  onEdit: (name: string) => void;
  onAddUser: () => void;
}

type FormValues = {
  name: string;
}

const Form = ({ userGroup, onAddUser, onEdit }: Props) => {
  const { register, handleSubmit, errors } = useForm<FormValues>({ mode: 'onBlur' });
  const [userCounter, setUserCounter] = useState(0);

  useEffect(() => {
    return setUserCounter(counter(userGroup?.users, 8));
  }, [userGroup]);

  const handleSaveClick = ({ name }: Record<string, string>) => {
    onEdit(name);
  };

  const renderUsers = (userGroup: UserGroup) => {
    return (
      <Styled.UserList>
        {map(userGroup?.users, (user, index) => {
          if (index <= 7) {
            return (
              <Styled.UserAvatarNoPhoto key={user?.id} name={user?.name} />
            );
          }
        })}
        {userCounter > 0 && (
          <Styled.UsersCounter onClick={onAddUser} data-testid="count-users">
            +{userCounter}
          </Styled.UsersCounter>
        )}
      </Styled.UserList>
    );
  };

  return (
    <>
      <Styled.Layer.Title data-testid={userGroup?.name}>
        <ContentIcon icon="user-groups">
          <InputTitle
            resume
            name="name"
            ref={register({
              required: isRequired(),
              maxLength: maxLength()
            })}
            isDisabled={!!errors.name}
            defaultValue={userGroup?.name}
            onClickSave={handleSubmit(handleSaveClick)}
          />
          {errors.name && (
            <Styled.FieldErrorWrapper>
              <Icon name="error" color="error" />
              <Text tag="H6" color="error">{errors.name.message}</Text>
            </Styled.FieldErrorWrapper>
          )}
        </ContentIcon>
      </Styled.Layer.Title>
      <Styled.Layer.Users>
        <ContentIcon icon="user">
          <Text tag="H2" color="light">Users</Text>
          <Styled.ButtonAdd
            name="plus-circle"
            icon="plus-circle"
            color="light"
            onClick={onAddUser}
          >
            Add / Remove user
          </Styled.ButtonAdd>
          {renderUsers(userGroup)}
        </ContentIcon>
      </Styled.Layer.Users>
    </>
  );
};

export default Form;
