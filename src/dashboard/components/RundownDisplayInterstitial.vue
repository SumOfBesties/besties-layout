<template>
    <ipl-space
        color="secondary"
        class="interstitial-display"
        :style="{ opacity: props.allowCompletionChange && props.interstitial.completed ? '0.5' : '1' }"
    >
        <div>
            <schedule-item-type-badge
                :schedule-item="props.interstitial"
                class="m-b-2"
            />
            <div class="interstitial-title">{{ props.interstitial.title }}</div>
            <div v-if="props.interstitial.talentIds.length > 0">
                {{ talentStore.formatTalentIdList(props.interstitial.talentIds, 4) }}
            </div>
        </div>
        <div>
            <ipl-button
                v-if="props.allowCompletionChange"
                small
                :color="props.interstitial.completed ? 'red' : 'green'"
                class="completion-button"
                @click="setCompleted(!props.interstitial.completed)"
            >
                <font-awesome-icon
                    :icon="props.interstitial.completed ? 'rotate-left' : 'check'"
                    size="xl"
                />
                <div>{{ props.interstitial.completed ? 'Not completed' : 'Complete' }}</div>
            </ipl-button>
        </div>
    </ipl-space>
</template>

<script setup lang="ts">
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { OtherScheduleItem } from 'types/schemas';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';
import ScheduleItemTypeBadge from './ScheduleItemTypeBadge.vue';

library.add(faCheck, faRotateLeft);

const talentStore = useTalentStore();

const props = withDefaults(defineProps<{
    allowCompletionChange?: boolean
    interstitial: OtherScheduleItem
}>(), {
    allowCompletionChange: false
});

async function setCompleted(completed: boolean) {
    await sendMessage('schedule:setInterstitialCompleted', { scheduleItemId: props.interstitial.id, completed });
}
</script>

<style scoped lang="scss">
.interstitial-title {
    font-size: 1.25em;
    font-weight: 600;
}

.interstitial-display {
    display: flex;
    align-items: center;

    > *:first-child {
        flex-grow: 1;
    }
}

.completion-button {
    width: 95px;
    margin-left: 8px;
}
</style>
