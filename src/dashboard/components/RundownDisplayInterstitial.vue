<template>
    <ipl-space
        color="secondary"
        class="interstitial-display"
        :style="{ opacity: props.allowCompletionChange && props.interstitial.completed ? '0.5' : '1' }"
    >
        <div>
            <ipl-badge
                :color="props.interstitial.type === 'OTHER' ? '#ffC700' : '#3E62F0'"
                class="m-b-2"
            >
                {{ props.interstitial.type === 'SETUP' ? 'Setup Block' : 'Interstitial' }}
            </ipl-badge>
            <div class="interstitial-title">{{ props.interstitial.title }}</div>
            <div v-if="props.interstitial.talentIds.length > 0">
                {{ talentStore.formatTalentIdList(props.interstitial.talentIds) }}
            </div>
        </div>
        <div>
            <ipl-button
                v-if="props.allowCompletionChange"
                small
                :color="props.interstitial.completed ? 'red' : 'green'"
                @click="setCompleted(!props.interstitial.completed)"
            >
                <font-awesome-icon
                    :icon="props.interstitial.completed ? 'rotate-left' : 'check'"
                    size="xl"
                />
                <div style="margin-top: -2px">{{ props.interstitial.completed ? 'Not completed' : 'Complete' }}</div>
            </ipl-button>
        </div>
    </ipl-space>
</template>

<script setup lang="ts">
import { IplBadge, IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { OtherScheduleItem } from 'types/schemas';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';

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
    display: grid;
    align-items: center;
    grid-template-columns: 1fr 95px;
    gap: 8px;
}
</style>
