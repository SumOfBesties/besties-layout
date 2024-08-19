<template>
    <div class="omnibar-milestone-display">
        <div class="first-row">
            <div class="milestone-name">{{ props.incentive.name }}</div>
            <div>{{ formatNumber(props.incentive.total) }}/<span class="milestone-total">{{ formatNumber(props.incentive.goal) }}kr</span></div>
        </div>
        <vfd-pixel-text
            :font-size="24"
            text-align="left"
            :progress-bar="{ current: props.incentive.total, start: 0, end: props.incentive.goal, showStartEnd: false }"
        />
    </div>
</template>

<script setup lang="ts">
import VfdPixelText from 'components/VfdPixelText.vue';
import { CurrentBids } from 'types/schemas';
import { formatNumber } from 'client-shared/helpers/StringHelper';

const props = defineProps<{
    incentive: CurrentBids[number]
}>();
</script>

<style scoped lang="scss">
@use '../../styles/colors';

.omnibar-milestone-display {
    width: 98%;
}

.first-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: colors.$vfd-teal;
    font-size: 25px;
}

.milestone-total, .milestone-name {
    font-weight: 700;
}
</style>
