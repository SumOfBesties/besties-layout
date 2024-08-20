<template>
    <ipl-space color="secondary">
        <schedule-item-type-badge
            :schedule-item="props.speedrun"
            class="m-b-2"
        />
        <div class="speedrun-title">{{ props.speedrun.title }}</div>
        <div class="m-t-2">
            <span>est. {{ formatScheduleItemEstimate(props.speedrun) }}</span>
            <template v-if="props.speedrun.category != null">
                – {{ props.speedrun.category }}
            </template>
        </div>
        <div class="m-t-4">
            <font-awesome-icon icon="gamepad" size="sm" fixed-width /> {{ talentStore.formatSpeedrunTeamList(props.speedrun.teams) }}
        </div>
        <div
            v-if="props.speedrun.commentatorIds.length > 0"
            class="m-t-4"
        >
            <font-awesome-icon icon="headset" size="sm" fixed-width /> {{ talentStore.formatTalentIdList(props.speedrun.commentatorIds, 4) }}
        </div>
    </ipl-space>
</template>

<script setup lang="ts">
import { Speedrun } from 'types/schemas';
import { formatScheduleItemEstimate } from 'client-shared/helpers/StringHelper';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IplSpace } from '@iplsplatoon/vue-components';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle';
import { faGamepad } from '@fortawesome/free-solid-svg-icons/faGamepad';
import { faHeadset } from '@fortawesome/free-solid-svg-icons/faHeadset';
import ScheduleItemTypeBadge from './ScheduleItemTypeBadge.vue';

library.add(faCircle, faGamepad, faHeadset);

const talentStore = useTalentStore();

const props = withDefaults(defineProps<{
    isActive?: boolean
    speedrun: Speedrun
}>(), {
    isActive: false
});
</script>

<style scoped lang="scss">
.speedrun-title {
    font-size: 1.5em;
    font-weight: 600;
}
</style>
