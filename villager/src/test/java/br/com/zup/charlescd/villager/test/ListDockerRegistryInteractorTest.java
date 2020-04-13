/*
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed
 * with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package br.com.zup.charlescd.villager.test;

import br.com.zup.charlescd.villager.infrastructure.integration.registry.RegistryType;
import br.com.zup.charlescd.villager.infrastructure.persistence.DockerRegistryConfigurationEntity;
import br.com.zup.charlescd.villager.infrastructure.persistence.DockerRegistryConfigurationRepository;
import br.com.zup.charlescd.villager.interactor.registry.ListDockerRegistryInput;
import br.com.zup.charlescd.villager.interactor.registry.impl.ListDockerRegistryInteractorImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ListDockerRegistryInteractorTest {

    @Mock
    private DockerRegistryConfigurationRepository dockerRegistryConfigurationRepository;

    @Test
    public void testListDockerRegistriesWithSuccess() {

        // Mock - Docker Registry Configuration
        var applicationId = "a69c3cfb-5587-448f-b011-beae9a4a3fbb";

        when(dockerRegistryConfigurationRepository.listByApplicationId(applicationId)).thenAnswer(invocationOnMock -> {
            var result = new ArrayList<DockerRegistryConfigurationEntity>();

            result.add(mockAzureDockerRegistryData("edce5d09-e7a2-4763-910e-41c003f68fb9", "Docker Registry 1"));
            result.add(mockAWSDockerRegistryData("69d50e38-a34a-4198-920a-265ca1bf7d04", "Docker Registry 2"));
            result.add(mockAzureDockerRegistryData("43a9df98-dc87-4a10-acd8-2b634b25c036", "Docker Registry 3"));

            return result;
        });

        // Execute
        var interactor = new ListDockerRegistryInteractorImpl(dockerRegistryConfigurationRepository);
        var dockerRegistryList = interactor.execute(new ListDockerRegistryInput(applicationId));

        // Check
        assertThat(dockerRegistryList, notNullValue());
        assertThat(dockerRegistryList.get(0).getId(), is("edce5d09-e7a2-4763-910e-41c003f68fb9"));
        assertThat(dockerRegistryList.get(0).getName(), is("Docker Registry 1"));
        assertThat(dockerRegistryList.get(0).getProvider(), is(RegistryType.AZURE));
        assertThat(dockerRegistryList.get(0).getAuthorId(), is("456337ed-7af2-4f0d-9dfb-6e285ad00ee0"));
        assertThat(dockerRegistryList.get(1).getId(), is("69d50e38-a34a-4198-920a-265ca1bf7d04"));
        assertThat(dockerRegistryList.get(1).getName(), is("Docker Registry 2"));
        assertThat(dockerRegistryList.get(1).getProvider(), is(RegistryType.AWS));
        assertThat(dockerRegistryList.get(1).getAuthorId(), is("456337ed-7af2-4f0d-9dfb-6e285ad00ee0"));
        assertThat(dockerRegistryList.get(2).getId(), is("43a9df98-dc87-4a10-acd8-2b634b25c036"));
        assertThat(dockerRegistryList.get(2).getName(), is("Docker Registry 3"));
        assertThat(dockerRegistryList.get(2).getProvider(), is(RegistryType.AZURE));
        assertThat(dockerRegistryList.get(2).getAuthorId(), is("456337ed-7af2-4f0d-9dfb-6e285ad00ee0"));

    }

    @Test
    public void testListNoDockerRegistriesWithSuccess() {

        // Mock - Docker Registry Configuration
        var applicationId = "a69c3cfb-5587-448f-b011-beae9a4a3fbb";

        when(dockerRegistryConfigurationRepository.listByApplicationId(applicationId)).thenReturn(new ArrayList<>());

        // Execute
        var interactor = new ListDockerRegistryInteractorImpl(dockerRegistryConfigurationRepository);
        var dockerRegistryList = interactor.execute(new ListDockerRegistryInput(applicationId));

        // Check
        assertThat(dockerRegistryList.isEmpty(), is(true));

    }

    private DockerRegistryConfigurationEntity mockAzureDockerRegistryData(String id, String name) {
        var entity = new DockerRegistryConfigurationEntity();
        entity.id = id;
        entity.type = RegistryType.AZURE;
        entity.name = name;
        entity.authorId = "456337ed-7af2-4f0d-9dfb-6e285ad00ee0";
        entity.applicationId = "6eef9a19-f83e-43d1-8f00-eb8f12d4f116";
        entity.createdAt = LocalDateTime.now();
        entity.connectionData = new DockerRegistryConfigurationEntity.AzureDockerRegistryConnectionData("http://registry/test", "usertest", "passtest");
        return entity;
    }

    private DockerRegistryConfigurationEntity mockAWSDockerRegistryData(String id, String name) {
        var entity = new DockerRegistryConfigurationEntity();
        entity.id = id;
        entity.type = RegistryType.AWS;
        entity.name = name;
        entity.authorId = "456337ed-7af2-4f0d-9dfb-6e285ad00ee0";
        entity.applicationId = "6eef9a19-f83e-43d1-8f00-eb8f12d4f116";
        entity.createdAt = LocalDateTime.now();
        entity.connectionData = new DockerRegistryConfigurationEntity.AWSDockerRegistryConnectionData("http://registry/test", "accesskey", "secretkey", "br");
        return entity;
    }

}
