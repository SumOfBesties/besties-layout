<template>
    <div
        class="wrapper"
        :class="{ flash: props.flash }"
    >
        <span class="unlit">{{ unlitSegment ?? '8'.repeat(props.digitCount ?? 1) }}</span>
        <span class="digits">{{ props.padDigits ? String(props.value ?? '').padStart(props.digitCount ?? 1, '0') : props.value }}</span>
        <span v-if="props.alwaysLitSegment != null" class="always-lit-segment">{{ alwaysLitSegment }}</span>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    digitCount?: number
    unlitSegment?: string
    alwaysLitSegment?: string
    value?: number | string | null
    padDigits?: boolean
    flash?: boolean
}>(), {
    padDigits: false,
    flash: false
});
</script>

<style scoped lang="scss">
@use '../styles/colors';

.wrapper {
    font-family: 'DSEG7 Classic';
    position: relative;
    text-rendering: geometricPrecision;
    font-weight: 700;

    &.flash > .digits {
        animation: digits-flash 2s 3;
    }
}

.unlit {
    color: colors.$vfd-teal-unlit;
}

.digits, .always-lit-segment {
    color: colors.$vfd-teal;
    position: absolute;
    right: 0;
}

@keyframes digits-flash {
    0% {
        color: colors.$vfd-teal;
    }

    48% {
        color: colors.$vfd-teal;
    }

    50% {
        color: colors.$vfd-teal-unlit;
    }

    98% {
        color: colors.$vfd-teal-unlit;
    }

    100% {
        color: colors.$vfd-teal;
    }
}
</style>
