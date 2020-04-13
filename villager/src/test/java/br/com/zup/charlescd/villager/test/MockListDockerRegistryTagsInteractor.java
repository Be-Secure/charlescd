/*
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed
 * with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package br.com.zup.charlescd.villager.test;

import br.com.zup.charlescd.villager.interactor.registry.ListDockerRegistryTagsInput;
import br.com.zup.charlescd.villager.interactor.registry.ComponentTagDTO;
import br.com.zup.charlescd.villager.interactor.registry.ListDockerRegistryTagsInteractor;
import io.quarkus.test.Mock;

import javax.enterprise.context.ApplicationScoped;
import java.util.List;

@Mock
@ApplicationScoped
public class MockListDockerRegistryTagsInteractor implements ListDockerRegistryTagsInteractor {

    @Override
    public List<ComponentTagDTO> execute(ListDockerRegistryTagsInput input) {
        return null;
    }
}
