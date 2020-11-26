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

export type WarningMessage =
  | 'IMPORT_CSV'
  | 'MANUAL_TO_CSV'
  | 'CSV_TO_MANUAL'
  | 'MANUAL_TO_PERCENTAGE'
  | 'PERCENTAGE_TO_MANUAL'
  | 'PERCENTAGE_TO_CSV'
  | 'CSV_TO_PERCENTAGE';

export function getWarningText(warningMessage: WarningMessage) {
  if (warningMessage === 'CSV_TO_MANUAL') {
    return 'Your current base was imported using a .CSV file, manually creating your entire circle segmentation will be deleted and replaced.';
  }

  if (warningMessage === 'MANUAL_TO_CSV') {
    return 'Your current segmentation was created using manual rules, this rules will be replaced by the CSV content.';
  }

  if (warningMessage === 'PERCENTAGE_TO_MANUAL') {
    return 'Your current percentage circle will be converted to segmentation circle.';
  }

  if (warningMessage === 'PERCENTAGE_TO_CSV') {
    return 'Your current percentage circle will be converted to segmentation circle.';
  }

  if (warningMessage === 'MANUAL_TO_PERCENTAGE') {
    return 'Your current segmentation will be deleted and replaced with percentage rules.';
  }

  if (warningMessage === 'CSV_TO_PERCENTAGE') {
    return 'Your current segmentation will be deleted and replaced with percentage rules.';
  }

  return 'When you import another .CSV your entire circle segmentation will be deleted and replaced by the new one.';
}
