<template>
    <ipl-dialog
        :is-open="isOpen"
        @update:is-open="isOpen = $event"
        style="width: 500px"
    >
        <ipl-dialog-title
            title="Edit talent"
            color="secondary"
            @close="isOpen = $event"
        />
        <ipl-space
            color="secondary"
            class="m-t-8"
        >
            <ipl-message
                v-if="talentItem == null"
                type="warning"
            >
                The specified talent item couldn't be found.
            </ipl-message>
            <template v-else>
                <talent-item-editor-form
                    v-model="talentItem"
                    color="secondary"
                />
                <ipl-button
                    class="m-t-8"
                    color="green"
                    label="Save"
                    @click="onSave"
                />
            </template>
        </ipl-space>
    </ipl-dialog>
</template>

<script setup lang="ts">
import { IplButton, IplDialog, IplDialogTitle, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import TalentItemEditorForm from './TalentItemEditorForm.vue';
import { ref, watch } from 'vue';
import { v4 as uuidV4 } from 'uuid';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import cloneDeep from 'lodash/cloneDeep';
import { TalentItem } from 'types/ScheduleHelpers';

const talentStore = useTalentStore();

const isOpen = ref(false);
const talentItem = ref<TalentItem | null>(null);
let selectCallback: ((talentItem: TalentItem) => void) | null = null;

watch(isOpen, newValue => {
    if (!newValue) {
        selectCallback = null;
    }
});

function openForNew(cb: (talentItem: TalentItem) => void, name?: string) {
    talentItem.value = {
        id: uuidV4(),
        name: name ?? '',
        socials: {}
    };
    isOpen.value = true;
    selectCallback = cb;
}

function openForExisting(cb: (talentItem: TalentItem) => void, talentItemId: string) {
    talentItem.value = cloneDeep(talentStore.findTalentItemById(talentItemId) ?? null);
    selectCallback = cb;
    isOpen.value = true;
}

function onSave() {
    if (talentItem.value != null) {
        selectCallback?.(talentItem.value);
    }
    isOpen.value = false;
}

defineExpose({
    openForNew,
    openForExisting
});
</script>
