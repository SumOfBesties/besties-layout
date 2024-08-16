<template>
    <div class="donation-total layout horizontal center-vertical">
        <seven-segment-digits
            :digit-count="6"
            class="donation-total-digits"
            :value="tweenedTotal"
        />
        <div class="currency-label">
            <div>USD</div>
            <div>NOK</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import SevenSegmentDigits from 'components/SevenSegmentDigits.vue';
import { ref } from 'vue';
import { useTweenedNumber } from '../helpers/useTweenedNumber';

// todo
const donationTotal = ref(39573);
const tweenedTotal = useTweenedNumber(donationTotal);
</script>

<style scoped lang="scss">
@use '../styles/colors';

.donation-total {
    margin-top: -3px;
}

.donation-total-digits {
    font-size: 32px;
    margin-right: 4px;
}

.currency-label {
    font-size: 20px;
    font-weight: 700;
    line-height: 20px;

    > *:first-child {
        color: colors.$vfd-red-unlit;
    }

    > *:last-child {
        color: colors.$vfd-red;
    }
}
</style>
