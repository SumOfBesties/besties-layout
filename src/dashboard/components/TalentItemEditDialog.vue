<template>
    <ipl-dialog
        :is-open="props.isOpen"
        @update:is-open="emit('update:isOpen', $event)"
        style="width: 500px"
    >
        <ipl-dialog-title
            title="New talent"
            color="secondary"
            @close="emit('update:isOpen', false)"
        />
        <ipl-space
            color="secondary"
            class="m-t-8"
        >
            <talent-item-editor-form
                :model-value="props.modelValue"
                color="secondary"
            />
            <ipl-button
                class="m-t-8"
                color="green"
                label="Save"
                @click="emit('save')"
            />
        </ipl-space>
    </ipl-dialog>
</template>

<script setup lang="ts">
import { IplButton, IplDialog, IplDialogTitle, IplSpace } from '@iplsplatoon/vue-components';
import TalentItemEditorForm from './TalentItemEditorForm.vue';
import { Talent } from 'types/schemas';

const props = defineProps<{
    modelValue: Talent[number]
    isOpen: boolean
}>();

const emit = defineEmits<{
    'update:isOpen': [newValue: boolean],
    'save': []
}>();
</script>
