<template>
    <ipl-expanding-space
        title="Bid wars"
        expanded
    >
        <div class="layout horizontal center-horizontal">
            <ipl-checkbox
                v-model="completedBidsVisible"
                small
                label="Show completed bids"
            />
        </div>
        <bid-list-item
            v-for="bid in visibleBids"
            :key="bid.id"
            :bid="bid"
            class="m-t-8"
        />
    </ipl-expanding-space>
</template>

<script setup lang="ts">
import { IplCheckbox, IplExpandingSpace } from '@iplsplatoon/vue-components';
import { useAllTrackerDataStore } from 'client-shared/stores/AllTrackerDataStore';
import BidListItem from './BidListItem.vue';
import { computed, ref } from 'vue';
import { DateTime } from 'luxon';

const allTrackerDataStore = useAllTrackerDataStore();

const completedBidsVisible = ref(false);
const visibleBids = computed(() => {
    if (completedBidsVisible.value) return allTrackerDataStore.allBids;

    return allTrackerDataStore.allBids.filter(bid => {
        if (bid.speedrunEndTime == null) {
            return true;
        }
        const parsedEndTime = DateTime.fromISO(bid.speedrunEndTime);
        if (!parsedEndTime.isValid) {
            return true;
        }
        return parsedEndTime.diffNow().milliseconds > 0;
    });
});
</script>
