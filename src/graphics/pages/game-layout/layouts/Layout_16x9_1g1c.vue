<template>
    <div class="layout">
        <div class="camera-capture-column">
            <div
                class="camera-capture"
                data-capture-index="0"
            />
            <div class="below-camera">
                <player-nameplate :index="0" />
            </div>
        </div>
        <large-separator direction="vertical" />
        <div class="game-capture-column">
            <div
                class="game-capture"
                data-capture-index="0"
            />
            <div class="timer-wrapper">

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
import PlayerNameplate from 'components/PlayerNameplate.vue';
</script>

<style scoped lang="scss">
@use '../../../styles/colors';

.layout {
    display: grid;
    grid-template-columns: 445px 14px 1fr;
    grid-template-rows: 1fr 14px;
    height: 100%;
}

.camera-capture {
    aspect-ratio: 4 / 3;
    width: 100%;
    border-bottom: 3px solid colors.$layout-gap;
}

.game-capture {
    aspect-ratio: 16 / 9;
    width: 100%;
    border-bottom: 3px solid colors.$layout-gap;
}

.camera-capture-column {
    display: flex;
    flex-direction: column;
}

.game-capture-column {
    display: flex;
    flex-direction: column;
}

.below-camera {
    flex-grow: 1;
    background: colors.$layout-panel-background;
}

.timer-wrapper {
    flex-grow: 1;
    background: colors.$timer-background;
    border-right: 3px solid colors.$layout-gap;
    border-bottom: 3px solid colors.$layout-gap;
}
</style>
