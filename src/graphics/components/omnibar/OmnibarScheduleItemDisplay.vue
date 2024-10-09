<template>
    <div class="omnibar-schedule-item-display">
        <flip-flap-text
            :font-size="26"
            :text-content="props.scheduleItem?.title ?? 'Nothing!'"
            text-align="left"
            @scroll-started="onScrollStart(0)"
            @scroll-end-reached="onScrollEnd(0)"
        />
        <flip-flap-text
            :font-size="26"
            :text-content="secondLine"
            text-align="left"
            @scroll-started="onScrollStart(1)"
            @scroll-end-reached="onScrollEnd(1)"
        />
    </div>
</template>

<script setup lang="ts">
import VfdPixelText from 'components/VfdPixelText.vue';
import { ScheduleItem } from 'types/ScheduleHelpers';
import { computed, onMounted } from 'vue';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import FlipFlapText from "components/FlipFlapText.vue";

const talentStore = useTalentStore();

const props = defineProps<{
    scheduleItem?: ScheduleItem | null
}>();

const emit = defineEmits<{
    'readyToSwitch': []
}>();
let readyToSwitchMessageTimeout: number | undefined = undefined;
let finishedScrolls = [true, true];
onMounted(() => {
     readyToSwitchMessageTimeout = window.setTimeout(() => {
         emit('readyToSwitch');
     }, 1000);
});
// If the text on this slide scrolls, we want to show this slide at minimum until all displayed text has finished scrolling
function onScrollStart(lineIndex: number) {
    window.clearTimeout(readyToSwitchMessageTimeout);
    finishedScrolls[lineIndex] = false;
}
function onScrollEnd(lineIndex: number) {
    finishedScrolls[lineIndex] = true;
    if (finishedScrolls.every(scroll => scroll)) {
        emit('readyToSwitch');
    }
}

const secondLine = computed(() => {
    if (props.scheduleItem == null) return '';
    if (props.scheduleItem.type === 'SPEEDRUN') {
        if (!!props.scheduleItem.category) {
            return `${props.scheduleItem.category}·${talentStore.formatSpeedrunTeamList(props.scheduleItem.teams)}`;
        } else {
            return talentStore.formatSpeedrunTeamList(props.scheduleItem.teams);
        }
    } else {
        return talentStore.formatTalentIdList(props.scheduleItem.talentIds, 4);
    }
});
</script>

<style scoped lang="scss">
.omnibar-schedule-item-display {
    width: 100%;
}
</style>
