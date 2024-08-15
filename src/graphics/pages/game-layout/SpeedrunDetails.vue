<template>
    <div class="speedrun-details">
        <vfd-pixel-text
            :font-size="25"
            :text-content="scheduleStore.activeSpeedrun?.title"
            class="speedrun-title"
        />
        <div
            class="layout horizontal m-t-4"
            style="align-items: flex-end"
        >
            <div class="max-width">
                <vfd-pixel-text
                    :font-size="20"
                    :text-content="systemAndReleaseYear"
                />
                <vfd-pixel-text
                    :font-size="20"
                    :text-content="scheduleStore.activeSpeedrun?.category"
                />
            </div>
            <div class="estimate-label">EST.</div>
            <seven-segment-digits
                :digit-count="2"
                :value="parsedEstimate?.hours === 0 ? null : parsedEstimate?.hours"
                class="estimate-digits m-l-4"
            />
            <div
                class="estimate-digit-label"
                :class="{ unlit: parsedEstimate?.hours === 0 }"
            >
                H
            </div>
            <seven-segment-digits
                :digit-count="2"
                :value="parsedEstimate?.minutes"
                pad-digits
                class="estimate-digits"
            />
            <div class="estimate-digit-label">M</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import VfdPixelText from 'components/VfdPixelText.vue';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed } from 'vue';
import { isBlank } from 'client-shared/helpers/StringHelper';
import { Duration } from 'luxon';
import SevenSegmentDigits from 'components/SevenSegmentDigits.vue';

const scheduleStore = useScheduleStore();

const systemAndReleaseYear = computed(() =>
    [scheduleStore.activeSpeedrun?.system, scheduleStore.activeSpeedrun?.releaseYear].filter(item => !isBlank(item)).join('·'));
const parsedEstimate = computed(() =>
    scheduleStore.activeSpeedrun?.estimate == null
        ? null
        : Duration.fromISO(scheduleStore.activeSpeedrun.estimate).shiftTo('minutes', 'hours').toObject());
</script>

<style scoped lang="scss">
@use '../../styles/colors';
@use '../../styles/decorations';

.speedrun-details {
    @include decorations.inset-container;

    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.speedrun-title {
    margin-top: -8px;
}

.estimate-label, .estimate-digit-label {
    font-weight: 700;
    font-size: 20px;
    margin-bottom: -3px;
}

.estimate-label {
    color: colors.$vfd-red;
}

.estimate-digit-label {
    color: colors.$vfd-teal;

    &.unlit {
        color: colors.$vfd-teal-unlit;
    }
}

.estimate-digits {
    font-size: 32px;
}
</style>
