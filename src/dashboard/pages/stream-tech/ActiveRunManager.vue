<template>
    <div>
        <ipl-space class="run-selector-space">
            <ipl-button
                :disabled="!canSeekBackwards"
                @click="seekToPreviousRun"
            >
                <font-awesome-icon icon="chevron-left" />
                Previous
            </ipl-button>
            <ipl-button
                color="transparent"
                @click="scheduleItemSearchDialog?.open"
            >
                <font-awesome-icon icon="search" />
                Search the schedule...
            </ipl-button>
            <ipl-button
                :disabled="!canSeekForwards"
                @click="seekToNextRun"
            >
                Next
                <font-awesome-icon icon="chevron-right" />
            </ipl-button>
        </ipl-space>
        <schedule-item-search-dialog
            ref="scheduleItemSearchDialog"
        />
    </div>
</template>

<script setup lang="ts">
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed, ref } from 'vue';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import ScheduleItemSearchDialog from './ScheduleItemSearchDialog.vue';

library.add(faChevronRight, faChevronLeft, faSearch);

const scheduleItemSearchDialog = ref<InstanceType<typeof ScheduleItemSearchDialog>>();
const scheduleStore = useScheduleStore();

const canSeekBackwards = computed(() => {
    if (scheduleStore.activeSpeedrunIndex <= 0) return false;

    for (let i = scheduleStore.activeSpeedrunIndex - 1; i >= 0; i--) {
        const scheduleItem = scheduleStore.schedule.items[i];
        if (scheduleItem.type === 'SPEEDRUN') return true;
    }

    return false;
});

const canSeekForwards = computed(() => {
    if (scheduleStore.activeSpeedrunIndex === -1 || scheduleStore.activeSpeedrunIndex === scheduleStore.schedule.items.length - 1) return false;

    for (let i = scheduleStore.activeSpeedrunIndex + 1; i < scheduleStore.schedule.items.length; i++) {
        const scheduleItem = scheduleStore.schedule.items[i];
        if (scheduleItem.type === 'SPEEDRUN') return true;
    }

    return false;
});

async function seekToNextRun() {
    await sendMessage('speedrun:seekToNextRun');
}

async function seekToPreviousRun() {
    await sendMessage('speedrun:seekToPreviousRun');
}
</script>

<style scoped lang="scss">
.run-selector-space {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 8px;
}
</style>
