<template>
    <div
        class="separator"
        :class="props.direction"
    >
        <div class="highlight" />
        <div class="core" />
        <div class="shadow" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    direction: 'horizontal' | 'vertical'
}>();
</script>

<style scoped lang="scss">
@use '../styles/colors';

$separator-color: #B84C25;
$separator-color-highlight: #FF7D47;
$separator-color-shadow: colors.$layout-gap;

.separator {
    background-color: $separator-color;
    display: grid;

    &.vertical {
        min-width: 14px;
        grid-template-columns: 3px 1fr 3px;
    }

    &.horizontal {
        min-height: 14px;
        grid-template-rows: 3px 1fr 3px;
    }

    > .highlight {
        background-color: $separator-color-highlight;
    }

    > .core {
        background-color: $separator-color;
    }

    > .shadow {
        background-color: $separator-color-shadow;
    }
}
</style>
