<template>
    <div class="donation-total layout horizontal center-vertical">
        <flip-flap-digits
            :digit-count="6"
            class="donation-total-digits"
            :value="tweenedTotal"
        />
        <div class="currency-label">
            <div>EUR</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import SevenSegmentDigits from 'components/SevenSegmentDigits.vue';
import { useTweenedNumber } from '../helpers/useTweenedNumber';
import { useDonationStore } from 'client-shared/stores/DonationStore';
import FlipFlapDigits from "components/FlipFlapDigits.vue";

const donationStore = useDonationStore();
const tweenedTotal = useTweenedNumber(() => Math.floor(donationStore.donationTotal));
</script>

<style scoped lang="scss">
@use '../styles/colors';

.donation-total {
    margin-top: -3px;
}

.donation-total-digits {
    font-size: 1.75em;
    margin-right: 4px;
}

.currency-label {
    font-size: 1.25em;
    font-weight: 700;
    line-height: 1.1em;

    > *:first-child {
        color: colors.$vfd-dark-unlit;
    }

    > *:last-child {
        color: colors.$vfd-dark;
    }
}
</style>
