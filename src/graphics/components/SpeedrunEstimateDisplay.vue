<template>
    <div class="speedrun-estimate-display">
        <div class="estimate-label">EST.</div>
        <flip-flap-digits
            :digit-count="5"
            :value="parsedEstimate?.hours + ':' + parsedEstimate?.minutes"
            class="estimate-digits"
        />
    </div>
</template>

<script setup lang="ts">
import SevenSegmentDigits from 'components/SevenSegmentDigits.vue';
import { computed } from 'vue';
import { Duration } from 'luxon';
import FlipFlapDigits from "components/FlipFlapDigits.vue";

const props = defineProps<{
    estimate?: string
}>();

const parsedEstimate = computed(() =>
    props.estimate == null
        ? { minutes: 0, hours: 0 }
        : Duration.fromISO(props.estimate).shiftTo('minutes', 'hours').toObject());
</script>

<style scoped lang="scss">
@use '../styles/colors';

.speedrun-estimate-display {
    display: flex;
    align-items: flex-end;
}

.estimate-digits {
    font-size: 1.75em;
}

.estimate-label {
    color: colors.$vfd-dark;
}

.estimate-digit-label {
    color: colors.$vfd-light;

    &.unlit {
        color: colors.$vfd-light-unlit;
    }
}

.estimate-label, .estimate-digit-label {
    font-weight: 700;
    font-size: 1.2em;
    margin-bottom: -3px;
}
</style>
