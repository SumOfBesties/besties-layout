<template>
    <span class="timer-display">
        {{ props.time.hours }}:{{ padNumber(props.time.minutes) }}:{{ padNumber(props.time.seconds) }}.{{ String(Math.round(props.time.milliseconds)).padStart(3, '0')[0] }}
    </span>
</template>

<script setup lang="ts">
import { Duration } from 'types/schemas';
import { padNumber } from 'client-shared/helpers/StringHelper';

const props = defineProps<{
    time: Duration
}>();
</script>
