<template>
    <div class="layout-wrapper">
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
                    <speedrun-details />
                    <speedrun-timer class="m-t-8" />
                    <img
                        src="../../../assets/img/lslogo-white.png"
                        class="livesplit-logo"
                    >
                </div>
            </div>
            <div
                class="camera-capture"
                data-capture-index="0"
            />
            <div class="column">
                <player-nameplate :index="1" />
                <div class="third-column layout vertical">
                    <other-nameplate-grid class="m-t-12 m-x-16" />
                    <media-box class="grow m-x-8 m-y-8" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import LargeSeparator from 'components/LargeSeparator.vue';
import PlayerNameplate from '../PlayerNameplate.vue';
import SpeedrunDetails from '../SpeedrunDetails.vue';
import SpeedrunTimer from '../SpeedrunTimer.vue';
import OtherNameplateGrid from '../OtherNameplateGrid.vue';
import MediaBox from 'components/MediaBox.vue';
</script>

<style scoped lang="scss">
@use '../../../styles/colors';

.layout-wrapper {
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px;
    position: relative;

    > *:not(img) {
        width: 100%;
        height: 105px;
    }

    .livesplit-logo {
        width: 150px;
        position: absolute;
        opacity: 75%;
        bottom: 17px;
        left: 50%;
        transform: translateX(-50%);
    }
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

.third-column {
    background: colors.$layout-panel-background;
    height: 100%;
}
</style>
