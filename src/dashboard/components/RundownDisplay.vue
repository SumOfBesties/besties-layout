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
            v-if="interstitialsBeforeActiveRun.length === 0 && scheduleStore.activeSpeedrunIndex !== -1"
            class="text-center text-low-emphasis"
        >
            No interstitials before active run
        </div>
        <template v-else>
            <rundown-display-interstitial
                v-for="interstitial in interstitialsBeforeActiveRun"
                allow-completion-change
                :key="`interstitial_${interstitial.id}`"
                :interstitial="interstitial"
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
                    class="m-t-8"
                />
                <rundown-display-interstitial
                    v-else
                    :key="`interstitial_${scheduleItem.id}`"
                    :interstitial="scheduleItem"
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
import { OtherScheduleItem, Schedule } from 'types/schemas';
import RundownDisplaySpeedrun from './RundownDisplaySpeedrun.vue';
import RundownDisplayInterstitial from './RundownDisplayInterstitial.vue';

const scheduleStore = useScheduleStore();

const interstitialsBeforeActiveRun = computed<OtherScheduleItem[]>(() => {
    if (scheduleStore.activeSpeedrunIndex <= 0) return [];

    const result: OtherScheduleItem[] = [];
    for (let i = scheduleStore.activeSpeedrunIndex - 1; i >= 0; i--) {
        const scheduleItem = scheduleStore.schedule.items[i];
        if (scheduleItem.type === 'SPEEDRUN') break;
        result.push(scheduleItem);
    }
    return result;
});

const scheduleItemsAfterActiveRun = computed<Schedule['items'][number][]>(() => {
    if (scheduleStore.activeSpeedrunIndex === -1 || scheduleStore.activeSpeedrunIndex === scheduleStore.schedule.items.length - 1) return [];

    return scheduleStore.schedule.items.slice(scheduleStore.activeSpeedrunIndex + 1, scheduleStore.activeSpeedrunIndex + 7);
});
</script>

<style lang="scss" scoped>
.rundown-display {
    overflow-y: auto;
}
</style>
