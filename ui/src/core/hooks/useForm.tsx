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

import { isNotBlank, trimValue } from 'core/utils/validations';
import {
  useForm as useHookForm,
  RegisterOptions,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  FieldName
} from 'react-hook-form';

function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>(params?: UseFormProps<TFieldValues, TContext>) {
  const formMethods: UseFormReturn <TFieldValues> = useHookForm<
    TFieldValues,
    TContext
  >(params);

  function customRegisterFieldRef(registerOptions?: RegisterOptions) {
    const customRules: any = {
      ...registerOptions,
      validate: {
        ...registerOptions?.validate,
        notBlank: isNotBlank
      },
      setValueAs: trimValue
    };

    return formMethods.register(customRules);
  }

  return {
    ...formMethods,
    register: customRegisterFieldRef
  };
}

export default useForm;
