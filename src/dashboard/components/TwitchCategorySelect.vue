<template>
    <div>
        <ipl-label>Twitch category</ipl-label>
        <div class="layout horizontal center-vertical">
            <ipl-space
                class="twitch-category-select"
                clickable
                :color="props.color"
                @click="onClick"
            >
                <span>{{ props.modelValue?.name ?? 'N/A' }}</span>
            </ipl-space>
            <ipl-button
                v-if="props.modelValue != null"
                icon="xmark"
                color="red"
                inline
                @click="emit('update:modelValue', undefined)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { IplButton, IplLabel, IplSpace } from '@iplsplatoon/vue-components';
import { ScheduleItem } from 'types/ScheduleHelpers';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { inject } from 'vue';
import { TwitchCategorySearchDialogInjectionKey } from '../helpers/Injections';

library.add(faXmark);

const props = defineProps<{
    modelValue: ScheduleItem['twitchCategory']
    color: 'secondary' | 'primary'
}>();

const emit = defineEmits<{
    'update:modelValue': [newValue: ScheduleItem['twitchCategory']]
}>();

const twitchCategorySelectDialog = inject(TwitchCategorySearchDialogInjectionKey);
function onClick() {
    twitchCategorySelectDialog?.value?.open(newValue => emit('update:modelValue', newValue));
}
</script>

<style scoped lang="scss">
.twitch-category-select {
    padding: 4px;
    text-align: center !important;
    box-sizing: border-box;

    img {
        height: 12px;
        display: inline-block;
        border: 1px solid var(--ipl-input-color);
        margin-top: 1px;
    }

    span {
        margin-left: 6px;
        font-weight: 600;
    }
}

.ipl-button {
    font-size: 0.6em;
    margin-left: 4px;
}
</style>
