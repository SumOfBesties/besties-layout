<template>
    <div class="intermission-layout">
        <div class="bg-panel">
            <div class="layout horizontal logos">
                <img src="../../assets/img/large-logo.png">
                <media-box class="media-box" />
            </div>
            <intermission-prize-display class="max-width prize-display" />
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
import MediaBox from 'components/MediaBox.vue';
import IntermissionPrizeDisplay from './IntermissionPrizeDisplay.vue';
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

.logos {
    justify-content: space-between;
    margin: 50px 60px 0;

    img {
        width: 250px;
    }

    .media-box {
        width: 400px;
        height: 100%;
    }
}

.prize-display {
    margin-top: 56px;
}
</style>
