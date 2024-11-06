<template>
    <div class="omnibar-bid-war-display layout horizontal">
		<flip-flap-text
			style="flex-basis: 100%; margin-left: 4px; margin-right: 8px"
			:font-size="25"
			text-align="left"
			class="grow"
			:text-content="props.bidWar.speedrunName + '|' + props.bidWar.name"/>
		<flip-flap-text
			style="flex-basis: 100%; margin-right: 4px"
			:font-size="25"
			text-align="left"
			class="grow"
			v-if="props.bidWar.options?.length === 0 && props.bidWar.userOptionsAllowed"
			text-content="No options submitted. Donate now to add your own!"/>
		<flip-flap-text
			style="flex-basis: 100%; margin-right: 8px"
			:font-size="25"
			text-align="left"
			class="bid-war-option"
			:class="{ 'is-winning': highestOptionTotal !== 0 && props.bidWar.options[0].total === highestOptionTotal }"
			v-if="props.bidWar.options != undefined && props.bidWar.options.length > 0"
			:text-content="props.bidWar.options[0]?.name + ' - ' + props.bidWar.options[0]?.total + '€'"/>
		<flip-flap-text
			style="flex-basis: 100%; margin-right: 8px"
			:font-size="25"
			text-align="left"
			class="bid-war-option"
			:class="{ 'is-winning': highestOptionTotal !== 0 && props.bidWar.options[1].total === highestOptionTotal }"
			v-if="props.bidWar.options != undefined && props.bidWar.options?.length > 1"
			:text-content="props.bidWar.options[1]?.name + ' - ' + props.bidWar.options[1]?.total + '€'"/>
		<flip-flap-text
			:font-size="25"
			text-align="left"
			style="width: 100px; margin-right: 4px"
			class="bid-war-option"
			v-if="props.bidWar.options != undefined && props.bidWar.options?.length > 2"
			:text-content="'+' + (props.bidWar.options.length - 2)"/>
    </div>
</template>

<script setup lang="ts">
import { CurrentBids } from 'types/schemas';
import { formatNumber, isBlank } from 'client-shared/helpers/StringHelper';
import FittedContent from 'components/FittedContent.vue';
import { computed, inject } from 'vue';
import {
    MaxOmnibarBidWarItemsInjectionKey,
    MaxOmnibarBidWarTitleWidthInjectionKey
} from '../../../dashboard/helpers/Injections';
import FlipFlapText from "components/FlipFlapText.vue";

const props = defineProps<{
    bidWar: CurrentBids[number]
}>();

const highestOptionTotal = computed(() => Math.max(...(props.bidWar.options?.map(option => option.total) ?? [])));

const maxOptions = inject(MaxOmnibarBidWarItemsInjectionKey, 4);
const maxTitleWidth = inject(MaxOmnibarBidWarTitleWidthInjectionKey, 275);
</script>

<style scoped lang="scss">
@use '../../styles/colors';

.omnibar-bid-war-display {
    width: 100%;
}

.bid-war-title {
    color: colors.$vfd-light;
    font-size: 25px;
    font-weight: 700;
}

.no-options-message {
    font-size: 25px;
    color: colors.$vfd-light;
    font-weight: 700;
    overflow: hidden;
    width: 100%;

    > * {
        border: 2px solid colors.$vfd-light;
        padding: 6px 8px;
    }
}

.bid-war-option, .bid-war-duel-option {
    --option-color: #{colors.$vfd-light};

    border: 2px solid var(--option-color);
    color: var(--option-color);
	overflow: hidden;

    &.is-winning {
        --option-color: #40AA50;
    }
}

.bid-war-duel-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    overflow: hidden;
    width: 100%;
}

.bid-war-duel-option {
    display: flex;
    align-items: center;

    &:last-child {
        flex-direction: row-reverse;

        .option-numbers {
            padding-left: 6px;
            padding-right: 4px;
        }
    }

    .option-name {
        width: 100%;
        font-size: 25px;
        font-weight: 700;
        margin: 0 4px;
    }

    .option-numbers {
        background-color: var(--option-color);
        color: colors.$vfd-background;
        min-width: 54px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding-right: 6px;
        padding-left: 4px;
        height: 100%;

        .percentage {
            font-weight: 700;
            font-size: 25px;
        }

        .total {
            font-family: 'Roboto Condensed', sans-serif;
            font-size: 18px;
            margin-top: -4px;
        }
    }
}

.bid-war-options {
    display: grid;
}

.bid-war-option {
    margin-right: 4px;
    font-size: 20px;
    font-weight: 700;
    position: relative;

    .option-name {
        margin: 6px 4px 0;
    }

    .option-total {
        position: absolute;
        bottom: -2px;
        left: -2px;
        background-color: var(--option-color);
        color: colors.$vfd-background;
        font-family: 'Roboto Condensed', sans-serif;
        font-size: 18px;
        padding: 0 4px;
    }
}

.extra-option-box {
    background-color: colors.$vfd-light;
    color: colors.$vfd-background;
    text-align: center;
    padding: 0 8px;
    font-weight: 700;

    .extra-option-count {
        font-size: 32px;
        margin-top: 10px;
    }
}
</style>
