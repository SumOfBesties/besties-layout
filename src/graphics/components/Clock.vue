<template>
    <div class="layout vertical center-vertical">
        <flip-flap-digits
            unlit-segment="88:88"
            :value="time"
            class="time-display"
        />
        <flip-flap-text
            :font-size="15"
            :text-content="date"
            align="center"
        />
    </div>
</template>

<script setup lang="ts">
import SevenSegmentDigits from 'components/SevenSegmentDigits.vue';
import { Configschema } from 'types/schemas';
import { onMounted, onUnmounted, ref } from 'vue';
import { DateTime } from 'luxon';
import VfdPixelText from 'components/VfdPixelText.vue';
import FlipFlapText from "components/FlipFlapText.vue";
import FlipFlapDigits from "components/FlipFlapDigits.vue";

const zone = (nodecg.bundleConfig as Configschema)?.event?.timezone ?? 'Etc/GMT';
const time = ref('--:--');
const date = ref('--- --');

function getCurrentTime(): DateTime {
    return DateTime.now().setZone(zone);
}

function setDate(now: DateTime): void {
    time.value = now.toFormat('HH:mm');
    date.value = now.toFormat('MMM dd').toUpperCase();
}

let timeUpdateInterval: number | undefined = undefined;
onMounted(() => {
    timeUpdateInterval = window.setInterval(() => {
        setDate(getCurrentTime());
    }, 1000);
});
onUnmounted(() => {
    window.clearInterval(timeUpdateInterval);
});
setDate(getCurrentTime());
</script>

<style scoped lang="scss">
.time-display {
    font-size: 1.25em;
    margin-bottom: 2px;
    margin-top: -2px;
    margin-left: -4px;
}
</style>
