<template>
    <ipl-space color="secondary">
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
    </ipl-space>
</template>

<script setup lang="ts">
import { IplBadge, IplSpace } from '@iplsplatoon/vue-components';
import { OtherScheduleItem } from 'types/schemas';
import { useTalentStore } from 'client-shared/stores/TalentStore';

const talentStore = useTalentStore();

const props = defineProps<{
    interstitial: OtherScheduleItem
}>();
</script>

<style scoped lang="scss">
.interstitial-title {
    font-size: 1.25em;
    font-weight: 600;
}
</style>
