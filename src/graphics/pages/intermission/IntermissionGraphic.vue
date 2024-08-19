<template>
    <div class="intermission-layout">
        <div class="bg-panel">
            COL 1
        </div>
        <large-separator direction="vertical" />
        <div class="bg-panel right-panel">
            <intermission-schedule />
            <div class="bg-inset camera-border" />
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
        display: flex;
        flex-direction: column;

        &.right-panel {
            $schedule-height: 720px;
            // Will explode if the schedule's height changes, but I don't foresee that.
            clip-path: polygon(0% 0%, 0% 100%, 53px 100%, 53px $schedule-height, calc(100% - 53px) $schedule-height, calc(100% - 53px) calc(100% - 53px), 50px calc(100% - 53px), 53px 100%, 100% 100%, 100% 0%);

            > .camera-border {
                margin-top: 40px;
                margin-bottom: 10px;
                height: 100%;
            }
        }
    }
}
</style>
