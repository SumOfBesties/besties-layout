<template>
    <ipl-expanding-space
        title="Bid wars & Incentives"
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
import { useCurrentTrackerDataStore } from 'client-shared/stores/CurrentTrackerDataStore';

const allTrackerDataStore = useAllTrackerDataStore();
const currentTrackerDataStore = useCurrentTrackerDataStore();

const completedBidsVisible = ref(false);
const visibleBids = computed(() => completedBidsVisible.value
    ? allTrackerDataStore.allBids
    : currentTrackerDataStore.currentBids);
</script>
