<template>
    <ipl-space color="secondary">
        <ipl-badge
            v-if="props.isActive"
            color="#F42929"
            class="m-b-2"
        >
            <font-awesome-icon icon="circle" size="xs" />
            Active speedrun
        </ipl-badge>
        <div class="speedrun-title">{{ props.speedrun.title }}</div>
        <div class="m-t-2">
            <span>est. {{ formatDuration(props.speedrun.estimate) }}</span>
            <template v-if="props.speedrun.category != null">
                – {{ props.speedrun.category }}
            </template>
        </div>
        <div class="m-t-4">
            <font-awesome-icon icon="gamepad" size="sm" fixed-width /> {{ formatSpeedrunPlayers(props.speedrun) }}
        </div>
        <div
            v-if="props.speedrun.commentatorIds.length > 0"
            class="m-t-4"
        >
            <font-awesome-icon icon="headset" size="sm" fixed-width /> {{ talentStore.formatTalentIdList(props.speedrun.commentatorIds) }}
        </div>
    </ipl-space>
</template>

<script setup lang="ts">
import { Speedrun } from 'types/schemas';
import { formatDuration, prettyPrintList } from 'client-shared/helpers/StringHelper';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IplBadge, IplSpace } from '@iplsplatoon/vue-components';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle';
import { faGamepad } from '@fortawesome/free-solid-svg-icons/faGamepad';
import { faHeadset } from '@fortawesome/free-solid-svg-icons/faHeadset';

library.add(faCircle, faGamepad, faHeadset);

const talentStore = useTalentStore();

const props = withDefaults(defineProps<{
    isActive?: boolean
    speedrun: Speedrun
}>(), {
    isActive: false
});

function formatSpeedrunPlayers(speedrun: Speedrun): string {
    const playerCount = speedrun.teams.reduce((result, team) => {
        result += team.playerIds.length;
        return result;
    }, 0);

    if (playerCount === 0) {
        return 'No players?!';
    } else if (playerCount >= 6) {
        return `${playerCount} players`;
    }

    return speedrun.teams.reduce((result, team, index, array) => {
        result += prettyPrintList(team.playerIds.map(playerId =>
            talentStore.findTalentItemById(playerId.id)?.name ?? `Unknown Talent ${playerId.id}`));
        if (index !== array.length - 1) {
            result += ' vs. ';
        }
        return result;
    }, '');
}
</script>

<style scoped lang="scss">
.speedrun-title {
    font-size: 1.5em;
    font-weight: 600;
}
</style>
