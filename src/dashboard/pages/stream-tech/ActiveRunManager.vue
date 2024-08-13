<template>
    <div
        class="layout vertical"
        style="overflow: hidden;"
    >
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
        <ipl-message
            v-if="scheduleStore.activeSpeedrun == null"
            type="warning"
        >
            No speedrun is currently active
        </ipl-message>
        <template v-else>
            <ipl-space class="m-t-8">
                <div class="m-y-8">
                    <div class="text-low-emphasis">Active run ({{ speedrunCount.current === -1 ? '?' : speedrunCount.current }}/{{ speedrunCount.total }})</div>
                    <div class="speedrun-name">{{ scheduleStore.activeSpeedrun.title }}</div>
                    <div>{{ scheduleStore.activeSpeedrun.category }}</div>
                </div>
                <div class="speedrun-details">
                    <ipl-data-row
                        label="System"
                        :value="`${scheduleStore.activeSpeedrun.system ?? 'Unknown'}${scheduleStore.activeSpeedrun.emulated ? ' (Emulated)' : ''}`"
                    />
                    <ipl-data-row
                        label="Release year"
                        :value="scheduleStore.activeSpeedrun.releaseYear"
                    />
                </div>
                <div class="m-t-8 text-center">
                    <ipl-button
                        inline
                        @click="scheduleItemEditor?.openForActiveSpeedrun"
                    >
                        <font-awesome-icon icon="pen-to-square" />
                        Edit active run
                    </ipl-button>
                </div>
            </ipl-space>
            <timer-manager class="m-t-8" />
        </template>
        <schedule-item-search-dialog
            ref="scheduleItemSearchDialog"
        />
    </div>
</template>

<script setup lang="ts">
import { IplButton, IplDataRow, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed, inject, ref } from 'vue';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import ScheduleItemSearchDialog from './ScheduleItemSearchDialog.vue';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { ScheduleItemEditorInjectionKey } from '../../helpers/Injections';
import TimerManager from './TimerManager.vue';

library.add(faChevronRight, faChevronLeft, faSearch, faPenToSquare);

const scheduleItemSearchDialog = ref<InstanceType<typeof ScheduleItemSearchDialog>>();
const scheduleStore = useScheduleStore();

const scheduleItemEditor = inject(ScheduleItemEditorInjectionKey);

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

const speedrunCount = computed(() => scheduleStore.speedrunCount(scheduleStore.activeSpeedrun?.id));

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

.speedrun-name {
    font-weight: 700;
    font-size: 2em;
}

.speedrun-details {
    display: grid;
    column-gap: 8px;
    grid-template-columns: repeat(2, 1fr);
}
</style>
