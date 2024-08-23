<template>
    <ipl-expanding-space title="Prizes">
        <div class="layout horizontal center-horizontal">
            <ipl-checkbox
                v-model="showUnavailablePrizes"
                small
                label="Show unavailable prizes"
            />
        </div>
        <prize-list-item
            v-for="prize in visiblePrizes"
            :key="prize.id"
            class="m-t-8"
            :prize="prize"
        />
    </ipl-expanding-space>
</template>

<script setup lang="ts">
import { IplCheckbox, IplExpandingSpace } from '@iplsplatoon/vue-components';
import { useAllTrackerDataStore } from 'client-shared/stores/AllTrackerDataStore';
import PrizeListItem from './PrizeListItem.vue';
import { computed, ref } from 'vue';
import { useCurrentTrackerDataStore } from 'client-shared/stores/CurrentTrackerDataStore';

const allTrackerDataStore = useAllTrackerDataStore();
const currentTrackerDataStore = useCurrentTrackerDataStore();

const showUnavailablePrizes = ref(false);
const visiblePrizes = computed(() => showUnavailablePrizes.value ? allTrackerDataStore.allPrizes : currentTrackerDataStore.currentPrizes);
</script>
