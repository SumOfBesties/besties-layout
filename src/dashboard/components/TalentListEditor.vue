<template>
    <div>
        <draggable
            :list="internalTalentList"
            item-key="id"
            handle=".talent-item-grip"
            group="talent-items"
            @change="onChange"
        >
            <template #item="{ element, index }">
                <ipl-expanding-space
                    class="talent-item-editor m-t-8"
                    :color="props.color"
                >
                    <template #title>
                        {{ props.talentItemMap[element.id].name }}
                    </template>
                    <template #header-extra>
                        <div class="layout horizontal center-vertical">
                            <ipl-button
                                small
                                icon="user-xmark"
                                color="red"
                                @click="onRemove(index)"
                            />
                            <font-awesome-icon
                                icon="grip-vertical"
                                class="talent-item-grip"
                            />
                        </div>
                    </template>
                    <talent-item-editor-form :model-value="props.talentItemMap[element.id]" />
                </ipl-expanding-space>
            </template>
        </draggable>
    </div>
</template>

<script setup lang="ts">
import { Talent } from 'types/schemas';
import TalentItemEditorForm from './TalentItemEditorForm.vue';
import { ref, watch } from 'vue';
import Draggable from 'vuedraggable';
import { IplButton, IplExpandingSpace } from '@iplsplatoon/vue-components';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { faUserXmark } from '@fortawesome/free-solid-svg-icons/faUserXmark';

library.add(faGripVertical, faUserXmark);

const props = defineProps<{
    talentList: { id: string }[]
    talentItemMap: Record<string, Talent[number]>
    color: 'primary' | 'secondary'
}>();

const emit = defineEmits<{
    'update:talentList': [newValue: { id: string }[]]
}>();

const internalTalentList = ref<{ id: string }[]>([]);
watch(props.talentList, newValue => {
    internalTalentList.value = newValue.filter(talentId => props.talentItemMap[talentId.id] != null);
}, { immediate: true });

function onRemove(talentIndex: number) {
    internalTalentList.value = internalTalentList.value.toSpliced(talentIndex, 1);
    onChange();
}

function onChange() {
    emit('update:talentList', internalTalentList.value);
}
</script>

<style lang="scss" scoped>
.talent-item-grip {
    color: var(--ipl-input-color);
    cursor: grab;
    padding: 0 4px 0 12px;
    font-size: 1.25em;
}
</style>
