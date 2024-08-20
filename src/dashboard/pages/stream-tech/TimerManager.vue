<template>
    <ipl-space class="timer-manager layout vertical">
        <div class="layout horizontal center-vertical m-x-8">
            <div
                class="m-y-16 m-r-8"
                style="margin-left: 4px"
            >
                <div v-if="scheduleStore.activeSpeedrun != null">est. {{ formatDuration(scheduleStore.activeSpeedrun.estimate) }}</div>
                <timer-display
                    :time="timerStore.timer.time"
                    class="main-timer-display"
                    :style="{ color: timerColor }"
                />
            </div>
            <div class="max-width main-timer-controls-layout">
                <ipl-button
                    :disabled="(scheduleStore.activeSpeedrun?.teams.length ?? 0) > 1 && timerStore.timer.state !== 'STOPPED'"
                    :color="startStopUndoButton.color"
                    @click="startStopUndoTimer"
                >
                    <font-awesome-icon :icon="startStopUndoButton.icon" />
                    {{ startStopUndoButton.label }}
                </ipl-button>
                <ipl-button
                    :disabled="['STOPPED', 'FINISHED'].includes(timerStore.timer.state)"
                    @click="pauseResumeTimer"
                >
                    <font-awesome-icon :icon="timerStore.timer.state === 'PAUSED' ? 'play' : 'pause'" />
                    {{ timerStore.timer.state === 'PAUSED' ? 'Resume' : 'Pause' }}
                </ipl-button>
                <ipl-button
                    color="red"
                    :disabled="timerStore.timer.state === 'STOPPED'"
                    @click="resetTimer"
                >
                    <font-awesome-icon icon="backward" />
                    Reset
                </ipl-button>
            </div>
        </div>
        <div class="team-list">
            <team-timer-manager
                v-for="team in scheduleStore.activeSpeedrun?.teams ?? []"
                :team="team"
                :key="team.id"
            />
        </div>
    </ipl-space>
</template>

<script setup lang="ts">
import { formatDuration } from 'client-shared/helpers/StringHelper';
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { useTimerStore } from 'client-shared/stores/TimerStore';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import { computed } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons/faFlagCheckered';
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause';
import { faBackward } from '@fortawesome/free-solid-svg-icons/faBackward';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import TimerDisplay from '../../components/TimerDisplay.vue';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import TeamTimerManager from './TeamTimerManager.vue';

library.add(faFlagCheckered, faPause, faBackward, faPlay, faRotateLeft, faStop, faChevronLeft, faChevronRight);

const scheduleStore = useScheduleStore();
const timerStore = useTimerStore();
const talentStore = useTalentStore();

const startStopUndoButton = computed(() => {
    switch (timerStore.timer.state) {
        case 'STOPPED':
            return {
                icon: 'play',
                label: 'Start',
                color: 'green'
            };
        case 'FINISHED':
            return {
                icon: 'rotate-left',
                label: 'Resume',
                color: 'yellow'
            };
        case 'PAUSED':
        case 'RUNNING':
            return {
                icon: 'flag-checkered',
                label: 'Finish',
                color: 'green'
            };
    }
});

const timerColor = computed(() => {
    switch (timerStore.timer.state) {
        case 'STOPPED':
        case 'RUNNING':
            return '#FFF';
        case 'PAUSED':
            return '#FFD337';
        default:
            return '#06D669';
    }
});

async function startStopUndoTimer() {
    switch (timerStore.timer.state) {
        case 'STOPPED':
            await sendMessage('timer:start');
            break;
        case 'RUNNING':
        case 'PAUSED':
            if (scheduleStore.activeSpeedrun?.teams.length === 1) {
                await sendMessage('timer:stop');
            }
            break;
        case 'FINISHED':
            if (scheduleStore.activeSpeedrun?.teams.length === 1) {
                await sendMessage('timer:undoStop');
            }
            break;
    }
}

async function pauseResumeTimer() {
    switch (timerStore.timer.state) {
        case 'RUNNING':
            await sendMessage('timer:pause');
            break;
        case 'PAUSED':
            await sendMessage('timer:start');
            break;
    }
}

async function resetTimer() {
    await sendMessage('timer:reset');
}
</script>

<style scoped lang="scss">
.timer-manager {
    padding: 0;
    overflow-y: auto;
}

.main-timer-display {
    font-size: 2.5em;
    font-weight: 700;
}

.main-timer-controls-layout {
    margin-left: 8px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.team-list {
    overflow-y: auto;
}
</style>
