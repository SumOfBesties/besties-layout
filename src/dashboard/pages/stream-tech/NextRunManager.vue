<template>
    <ipl-message
        v-if="scheduleStore.nextSpeedrun == null"
        type="info"
    >
        The next speedrun is unknown.
    </ipl-message>
    <ipl-space v-else>
        <div class="m-t-4 m-b-2">
            <div class="text-low-emphasis">Next run ({{ speedrunCount.current === -1 ? '?' : speedrunCount.current }}/{{ speedrunCount.total }})</div>
            <div class="speedrun-name">{{ scheduleStore.nextSpeedrun.title }}</div>
            <div class="m-b-8">
                <span>est. {{ formatDuration(scheduleStore.nextSpeedrun.estimate) }}</span>
                <template v-if="scheduleStore.nextSpeedrun.category != null">
                    – {{ scheduleStore.nextSpeedrun.category }}
                </template>
            </div>
            <div>
                <font-awesome-icon icon="gamepad" size="sm" fixed-width />
                {{ talentStore.formatSpeedrunTeamList(scheduleStore.nextSpeedrun.teams) }}
            </div>
            <div v-if="scheduleStore.nextSpeedrun.commentatorIds.length > 0">
                <font-awesome-icon icon="headset" size="sm" fixed-width />
                {{ talentStore.formatTalentIdList(scheduleStore.nextSpeedrun.commentatorIds, 4) }}
            </div>
        </div>
        <div class="speedrun-details m-b-8">
            <ipl-data-row
                label="System"
                :value="`${scheduleStore.nextSpeedrun.system ?? 'Unknown'}${scheduleStore.nextSpeedrun.emulated ? ' (Emulated)' : ''}`"
            />
            <ipl-data-row
                label="Release year"
                :value="scheduleStore.nextSpeedrun.releaseYear"
            />
            <ipl-data-row
                label="Layout"
                :value="scheduleStore.nextSpeedrun.layout"
            />
            <ipl-data-row
                label="Relay?"
                :value="scheduleStore.nextSpeedrun.relay ? 'Yes' : 'No'"
            />
            <ipl-data-row
                label="Twitch category"
                :value="scheduleStore.activeSpeedrun?.twitchCategory?.name ?? 'N/A'"
                style="grid-column: span 2"
            />
        </div>
        <div class="text-center">
            <ipl-button
                inline
                small
                @click="scheduleItemEditor?.openForNextSpeedrun"
            >
                <font-awesome-icon icon="pen-to-square" />
                Edit next run
            </ipl-button>
        </div>
    </ipl-space>
</template>

<script setup lang="ts">
import { IplButton, IplDataRow, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed, inject } from 'vue';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faGamepad } from '@fortawesome/free-solid-svg-icons/faGamepad';
import { faHeadset } from '@fortawesome/free-solid-svg-icons/faHeadset';
import { ScheduleItemEditorInjectionKey } from '../../helpers/Injections';
import { formatDuration } from 'client-shared/helpers/StringHelper';

library.add(faPenToSquare, faGamepad, faHeadset);

const scheduleItemEditor = inject(ScheduleItemEditorInjectionKey);

const scheduleStore = useScheduleStore();
const talentStore = useTalentStore();

const speedrunCount = computed(() => scheduleStore.speedrunCount(scheduleStore.nextSpeedrun?.id));
</script>

<style lang="scss" scoped>
.speedrun-name {
    font-weight: 600;
    font-size: 1.5em;
}

.speedrun-details {
    display: grid;
    column-gap: 8px;
    grid-template-columns: repeat(2, 1fr);
}
</style>
