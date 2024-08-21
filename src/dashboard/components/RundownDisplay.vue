<template>
    <ipl-space class="rundown-display">
        <div class="title large">Show Rundown</div>
        <ipl-message
            v-if="scheduleStore.activeSpeedrunIndex === -1"
            type="warning"
            class="m-b-8"
        >
            The active speedrun is not present in the schedule. The full rundown cannot be calculated.
        </ipl-message>
        <div
            v-if="scheduleStore.interstitialsBeforeActiveRun.length === 0 && scheduleStore.activeSpeedrunIndex !== -1"
            class="text-center text-low-emphasis"
        >
            No interstitials before active run
        </div>
        <template v-else>
            <rundown-display-interstitial
                v-for="interstitial in scheduleStore.interstitialsBeforeActiveRun"
                allow-completion-change
                :key="`interstitial_${interstitial.id}`"
                :interstitial="interstitial"
                :readonly="props.readonly"
                class="m-b-8"
            />
        </template>
        <hr>
        <ipl-message
            v-if="scheduleStore.activeSpeedrun == null"
            type="warning"
        >
            No speedrun is active.
        </ipl-message>
        <rundown-display-speedrun
            v-else
            :speedrun="scheduleStore.activeSpeedrun"
            :readonly="props.readonly"
            is-active
        />
        <hr>
        <div
            v-if="scheduleStore.activeSpeedrunIndex !== -1 && scheduleItemsAfterActiveRun.length === 0"
            class="text-center text-low-emphasis"
        >
            Nothing else is scheduled!
        </div>
        <template v-else>
            <template v-for="scheduleItem in scheduleItemsAfterActiveRun">
                <rundown-display-speedrun
                    v-if="scheduleItem.type === 'SPEEDRUN'"
                    :key="`speedrun_${scheduleItem.id}`"
                    :speedrun="scheduleItem"
                    :readonly="props.readonly"
                    class="m-t-8"
                />
                <rundown-display-interstitial
                    v-else
                    :key="`interstitial_${scheduleItem.id}`"
                    :interstitial="scheduleItem"
                    :readonly="props.readonly"
                    class="m-t-8"
                />
            </template>
        </template>
    </ipl-space>
</template>

<script setup lang="ts">
import { IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed } from 'vue';
import RundownDisplaySpeedrun from './RundownDisplaySpeedrun.vue';
import RundownDisplayInterstitial from './RundownDisplayInterstitial.vue';
import { ScheduleItem } from 'types/ScheduleHelpers';

const scheduleStore = useScheduleStore();

const props = withDefaults(defineProps<{
    readonly?: boolean
}>(), {
    readonly: false
});

const scheduleItemsAfterActiveRun = computed<ScheduleItem[]>(() => {
    if (scheduleStore.activeSpeedrunIndex === -1 || scheduleStore.activeSpeedrunIndex === scheduleStore.schedule.items.length - 1) return [];

    return scheduleStore.schedule.items.slice(scheduleStore.activeSpeedrunIndex + 1, scheduleStore.activeSpeedrunIndex + 7);
});
</script>

<style lang="scss" scoped>
.rundown-display {
    overflow-y: auto;
}
</style>
