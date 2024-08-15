<template>
    <div class="layout">
        <div class="game-captures-row">
            <div
                class="game-capture"
                data-capture-index="0"
            />
            <large-separator direction="vertical" />
            <div
                class="game-capture"
                data-capture-index="1"
            />
        </div>
        <div class="small-separator" />
        <div class="other-content-row">
            <div class="column">
                <player-nameplate :index="0" />
                <div class="timer-wrapper">

                </div>
            </div>
            <div
                class="camera-capture"
                data-capture-index="0"
            />
            <div class="column">
                <player-nameplate :index="1" />
                <div class="something-else">

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import LargeSeparator from 'components/LargeSeparator.vue';
import PlayerNameplate from 'components/PlayerNameplate.vue';
</script>

<style scoped lang="scss">
@use '../../../styles/colors';

.layout {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.game-captures-row {
    width: 100%;
    display: flex;
}

.game-capture {
    aspect-ratio: 16 / 9;
    width: 100%;
}

.small-separator {
    background-color: colors.$layout-gap;
    min-height: 3px;
}

.other-content-row {
    display: grid;
    grid-template-columns: 2.5fr 3fr 2.5fr;
    width: 100%;
    height: 100%;
}

.timer-wrapper {
    background: colors.$timer-background;
    height: 100%;
}

.column {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-style: solid;
    border-width: 0 3px 3px 3px;
    border-color: colors.$layout-gap;
}

.camera-capture {
    width: 100%;
    height: 100%;
}

.something-else {
    background: colors.$layout-panel-background;
    height: 100%;
}
</style>
