package io.charlescd.moove.domain.validation

import io.charlescd.moove.domain.Metadata
import io.charlescd.moove.domain.MetadataScopeEnum
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext

class MetadataValidator : ConstraintValidator<MetadataConstraint, Metadata> {

    override fun isValid(metadata: Metadata?, context: ConstraintValidatorContext?): Boolean {

        if (metadata == null) {
            return true
        }

        return this.hasValidScope(metadata.scope) && this.hasValidContent(metadata.content)
    }

    private fun hasValidScope(scope: MetadataScopeEnum): Boolean {
        return scope == MetadataScopeEnum.APPLICATION || scope == MetadataScopeEnum.CLUSTER
    }

    private fun hasValidContent(content: Map<String, String>): Boolean {

        val invalidMetadata = content.entries.filter {
            !this.hasValidLength(it.key, 64) || !this.hasValidLength(it.value, 254)
        }
        return hasKeys(content) && invalidMetadata.isEmpty()
    }

    private fun hasValidLength(value: String, exceededLimit: Int): Boolean {
        return value.length in 1 until exceededLimit
    }

    private fun hasKeys(metadata: Map<String, String>): Boolean {
        return metadata.entries.isNotEmpty()
    }
}
