<template>
    <span class="pronoun-badge">
        <slot />
    </span>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
@use '../styles/colors';

.pronoun-badge {
    background-color: colors.$vfd-teal;
    color: #000;
    padding: 1px 4px;
    font-size: 0.7em;
    display: inline-block;
    font-family: 'Roboto Condensed', 'Noto Sans JP', sans-serif;
    font-weight: 500;
}
</style>
