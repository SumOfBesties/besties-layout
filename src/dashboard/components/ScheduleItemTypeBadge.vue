<template>
    <ipl-badge
        v-if="props.scheduleItem.type !== 'SPEEDRUN' || props.scheduleItem.id === scheduleStore.activeSpeedrun?.id"
        :color="color"
        class="m-b-2"
    >
        <template v-if="props.scheduleItem.type === 'SPEEDRUN'">
            <font-awesome-icon icon="circle" size="xs" />
            Active run
        </template>
        <template v-else-if="props.scheduleItem.type === 'SETUP'">
            Setup Block
        </template>
        <template v-else>
            Interstitial
        </template>
    </ipl-badge>
</template>

<script setup lang="ts">
import { ScheduleItem } from 'types/ScheduleHelpers';
import { colors } from '../styles/colors';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IplBadge } from '@iplsplatoon/vue-components';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle';
import { computed } from 'vue';

library.add(faCircle);

const scheduleStore = useScheduleStore();

const props = defineProps<{
    scheduleItem: ScheduleItem
}>();

const color = computed(() => {
    switch (props.scheduleItem.type) {
        case 'SPEEDRUN':
            return colors.activeSpeedrun;
        case 'SETUP':
            return colors.setupBlock;
        default:
            return colors.interstitial;
    }
});
</script>

<style scoped lang="scss">

</style>
