<template>
    <div class="layout-wrapper">
        <div class="layout vertical">
            <div
                class="camera-capture layout-gap-bottom"
                data-capture-index="0"
            />
            <player-nameplate :index="0" />
            <div class="secondary-capture-layout layout-gap-bottom">
                <div class="bg-panel" />
                <div
                    class="game-capture secondary-game-capture"
                    data-capture-index="1"
                />
                <div class="bg-panel" />
            </div>
            <div class="grow layout vertical bg-panel">
                <other-nameplate-grid class="m-y-4 m-x-16" />
                <media-box class="grow m-b-4 m-x-12" />
            </div>
        </div>
        <large-separator direction="vertical" />
        <div class="layout vertical">
            <div
                class="game-capture main-game-capture layout-gap-bottom"
                data-capture-index="0"
            />
            <div class="timer-wrapper grow bg-timer layout-gap-bottom layout-gap-right layout horizontal center-vertical center-horizontal">
                <speedrun-timer class="bg-inset" hide-run-number />
                <speedrun-details class="m-l-16 bg-inset" />
            </div>
        </div>
        <large-separator
            direction="horizontal"
            style="grid-column: span 3"
        />
    </div>
</template>

<script setup lang="ts">
import LargeSeparator from 'components/LargeSeparator.vue';
import PlayerNameplate from '../PlayerNameplate.vue';
import SpeedrunTimer from '../SpeedrunTimer.vue';
import SpeedrunDetails from '../SpeedrunDetails.vue';
import OtherNameplateGrid from '../OtherNameplateGrid.vue';
import MediaBox from 'components/MediaBox.vue';
</script>

<style scoped lang="scss">
@use '../../../styles/colors';

.layout-wrapper {
    display: grid;
    grid-template-columns: 770px 14px 1fr;
    grid-template-rows: 1fr 14px;
    overflow: hidden;
    max-height: 1000px;
}

.secondary-capture-layout {
    display: grid;
    grid-template-columns: 80px 1fr 80px;
}

.camera-capture {
    width: 100%;
    height: 350px;
}

.main-game-capture {
    aspect-ratio: 4 / 3;
    width: 100%;
}

.secondary-game-capture {
    aspect-ratio: 2 / 1;
    width: 100%;
}

.timer-wrapper > * {
    width: 500px;
    height: 110px;
}
</style>
