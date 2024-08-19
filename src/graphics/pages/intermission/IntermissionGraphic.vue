<template>
    <div class="intermission-layout">
        <div class="bg-panel">
            COL 1
        </div>
        <large-separator direction="vertical" />
        <div class="bg-panel">
            <intermission-schedule />
        </div>
    </div>
</template>

<script setup lang="ts">
import LargeSeparator from 'components/LargeSeparator.vue';
import IntermissionSchedule from './IntermissionSchedule.vue';
</script>

<style scoped lang="scss">
.intermission-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 14px minmax(0, 1fr);
    height: 100%;

    > .bg-panel {
        padding: 40px 50px;
    }
}
</style>
