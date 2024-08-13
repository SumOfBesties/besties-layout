<template>
    <ipl-space>
        <div class="layout horizontal center-vertical">
            <div class="m-y-8 m-r-8">
                <div v-if="scheduleStore.activeSpeedrun != null">est. {{ formatDuration(scheduleStore.activeSpeedrun.estimate) }}</div>
                <div class="timer-display">
                    {{ timerStore.timer.time.hours }}:{{ padNumber(timerStore.timer.time.minutes) }}:{{ padNumber(timerStore.timer.time.seconds) }}.{{ String(Math.round(timerStore.timer.time.milliseconds)).padStart(3, '0')[0] }}
                </div>
            </div>
            <div class="max-width main-timer-controls-layout">
                <ipl-button
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
                    <font-awesome-icon
                        :icon="timerStore.timer.state === 'PAUSED' ? 'play' : 'pause'"
                    />
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
    </ipl-space>
</template>

<script setup lang="ts">
import { formatDuration, padNumber } from 'client-shared/helpers/StringHelper';
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

library.add(faFlagCheckered, faPause, faBackward, faPlay, faRotateLeft);

const scheduleStore = useScheduleStore();
const timerStore = useTimerStore();

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
                color: 'red'
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
.timer-display {
    font-size: 2.5em;
    font-weight: 700;
}

.main-timer-controls-layout {
    margin-left: 8px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}
</style>
