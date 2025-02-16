<template>
    <div
        class="wrapper"
        :class="{ flash: props.flash, [`color-${props.color}`]: true }"
    >
        <span class="unlit">{{'▓'.repeat((digitCount ?? unlitSegment?.length) ?? 1) }}</span>
        <span class="digits">{{ props.padDigits ? String(props.value ?? '').padStart(props.digitCount ?? 1, '0') : (props.unlitSegment != null && (props.value != null && typeof props.value !== "number") ? props.unlitSegment.substring(0, props.unlitSegment.length-props.value.length).concat(props.value) : props.value) }}</span>
        <span v-if="props.alwaysLitSegment != null" class="always-lit-segment">{{ alwaysLitSegment }}</span>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    digitCount?: number
    unlitSegment?: string | null
    alwaysLitSegment?: string
    value?: number | string | null
    padDigits?: boolean
    flash?: boolean
    color?: 'teal' | 'red'
}>(), {
    padDigits: false,
    flash: false,
    color: 'teal',
	unlitSegment: null
});
</script>

<style scoped lang="scss">
@use '../styles/colors';

.wrapper {
    font-family: 'Roboto Mono', 'split-flap-background';
    position: relative;
    text-rendering: geometricPrecision;
	font-weight: bold;
	text-decoration-line: line-through;
	text-decoration-style: solid;
	text-decoration-color: black;
	text-decoration-thickness: 1px;
	background-color: black;

    &.flash > .digits {
        animation: digits-flash 2s 3;
    }

    &.color-teal {
        .digits, .always-lit-segment {
            color: colors.$vfd-light;
        }

        .unlit {
            color: #222;
        }
    }

    &.color-red {
        .digits, .always-lit-segment {
            color: colors.$vfd-dark;
        }

        .unlit {
            color: colors.$vfd-dark;
        }
    }
}

.digits, .always-lit-segment {
    position: absolute;
    right: 0;
	text-decoration-line: line-through;
	text-decoration-style: solid;
	text-decoration-color: black;
	text-decoration-thickness: 1px;
}

@keyframes digits-flash {
    0% {
        opacity: 1;
    }

    48% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }

    98% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>
