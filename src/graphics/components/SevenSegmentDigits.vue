<template>
    <div class="wrapper">
        <span class="unlit">{{ unlitSegment ?? '8'.repeat(props.digitCount ?? 1) }}</span>
        <span class="digits">{{ props.padDigits ? String(props.value ?? '').padStart(props.digitCount ?? 1, '0') : props.value }}</span>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    digitCount?: number
    unlitSegment?: string
    value?: number | string | null
    padDigits?: boolean
}>(), {
    padDigits: false
});
</script>

<style scoped lang="scss">
@use '../styles/colors';

.wrapper {
    font-family: 'DSEG7 Classic';
    position: relative;
    text-rendering: geometricPrecision;
    font-weight: 700;
}

.unlit {
    color: colors.$vfd-teal-unlit;
}

.digits {
    color: colors.$vfd-teal;
    position: absolute;
    right: 0;
}
</style>
