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

import { Story } from '@storybook/react';
import Number, { Props } from 'core/components/Form/Number';
import styled from './styled';

export default {
  title: 'Components/Form/Number',
  component: Number,
};

const Template: Story<Props> = (props: Props) => {
  return (
    <styled.Form>
      <Number {...props} />
    </styled.Form>
  );
};

export const number = Template.bind({});
number.args = {
  name: 'input',
  label: 'Input number only'
};