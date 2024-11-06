<template>
    <div class="speedrun-timer">
        <div class="layout horizontal center-vertical center-horizontal">
            <div style="margin-left: -2px;">
                <div class="layout horizontal center-vertical">
                    <flip-flap-digits
                        unlit-segment="00:00:00.0"

                        class="run-timer"
                        style="width: max-content"
                        :value="formattedTimer.timer"
                        :flash="timerStore.timer.state === 'FINISHED'"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import SevenSegmentDigits from 'components/SevenSegmentDigits.vue';
import { useTimerStore } from 'client-shared/stores/TimerStore';
import { Duration } from 'luxon';
import { formatTimer } from 'client-shared/helpers/TimerHelper';
import FlipFlapDigits from "components/FlipFlapDigits.vue";

const scheduleStore = useScheduleStore();
const timerStore = useTimerStore();

const props = withDefaults(defineProps<{
    hideRunNumber?: boolean
}>(), {
    hideRunNumber: false
});

const speedrunCount = computed(() => scheduleStore.speedrunCount(scheduleStore.activeSpeedrun?.id));
const formattedTimer = computed(() => {
    if (timerStore.timer.time.hours > 0) {
        return {
            timer: formatTimer(timerStore.timer.time, false, false),
            alwaysLitSegment: '!:!!:!!.!'
        };
    } else {
        return {
            timer: formatTimer(timerStore.timer.time, true, false),
            alwaysLitSegment: '!!:!!.!'
        };
    }
});

const isCoop = computed(() => {
    if (scheduleStore.activeSpeedrun == null) return false;
    const teams = scheduleStore.activeSpeedrun.teams;
    return !scheduleStore.activeSpeedrun.relay && teams.some(team => team.playerIds.length > 1);
});

const isRace = computed(() => {
    if (scheduleStore.activeSpeedrun == null) return false;
    return scheduleStore.activeSpeedrun.teams.length > 1;
});

const isOverEstimate = computed(() => {
    if (scheduleStore.activeSpeedrun == null) return false;
    const estimateMillis = Duration.fromISO(scheduleStore.activeSpeedrun.estimate).shiftTo('milliseconds');
    return estimateMillis.milliseconds < timerStore.timer.time.rawTime;
});
</script>

<style scoped lang="scss">
@use '../../styles/colors';
@use '../../styles/decorations';

.speedrun-timer {
    font-size: 8px;
    font-weight: 700;
    //display: flex;
    //align-items: center;
    //justify-content: center;
    //box-sizing: border-box;
}

fieldset {
    border-left: 0;
    border-color: colors.$vfd-dark;
    height: 100%;
    padding: 4px 4px 4px 0;
    margin: 0 8px 0 -4px;

    > legend {
        color: colors.$vfd-dark;
        font-weight: 700;
    }

    .run-counter {
        font-size: 32px;
    }
}

.run-timer {
    font-size: 60px;
}

.run-info-text-segments {
    color: colors.$vfd-light-unlit;
    margin-top: -5px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 4px;

    > div > span {
        &:not(:first-child) {
            margin-left: 8px;
        }
    }

    span {
        &.lit {
            color: colors.$vfd-light;
        }

        &.segment-red {
            color: colors.$vfd-dark-unlit;

            &.lit {
                color: colors.$vfd-dark;
            }
        }
    }
}

.play-pause-section {
    span {
		font-size: 20px;
        font-weight: 700;
        color: colors.$vfd-light-unlit;
        transition: color 100ms;

        &.lit {
            color: colors.$vfd-light;

            path {
                fill: colors.$vfd-light;
            }
        }

        &:not(:first-child) {
            margin-left: 8px;
        }
    }

    svg {
        height: 15px;
        display: inline-block;
        position: relative;
    }

    path {
        transition: fill 100ms;
        fill: colors.$vfd-light-unlit;
    }
}

.estimate-alarm {
    width: 100%;
	font-size: 20px;
    text-align: center;
    color: colors.$vfd-background;
    background-color: colors.$vfd-dark-unlit;
    margin-top: 2px;

    &.lit {
        animation: alarm-flash 3s infinite;
    }
}

@keyframes alarm-flash {
    0% {
        background-color: colors.$vfd-dark;
    }

    45% {
        background-color: colors.$vfd-dark;
    }

    50% {
        background-color: colors.$vfd-dark-unlit;
    }

    95% {
        background-color: colors.$vfd-dark-unlit;
    }

    100% {
        background-color: colors.$vfd-dark;
    }
}
</style>
