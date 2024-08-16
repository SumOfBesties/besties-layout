<template>
    <div class="layout-wrapper layout vertical">
        <div class="max-width layout horizontal layout-gap-bottom">
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
        <div class="other-content-row">
            <div class="column">
                <player-nameplate :index="0" />
                <div class="timer-wrapper bg-timer layout vertical center-vertical max-height">
                    <speedrun-details class="bg-inset" />
                    <speedrun-timer class="m-t-8 bg-inset" />
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
                <div class="max-height bg-panel layout vertical">
                    <other-nameplate-grid class="m-t-12 m-x-16" />
                    <media-box class="grow m-x-8 m-y-8" />
                </div>
            </div>
        </div>
        <large-separator direction="horizontal" />
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

.game-capture {
    aspect-ratio: 16 / 9;
    width: 100%;
}

.other-content-row {
    display: grid;
    grid-template-columns: 2.5fr 3fr 2.5fr;
    width: 100%;
    height: 100%;
}

.timer-wrapper {
    padding: 18px;
    position: relative;

    > *:not(img) {
        width: 100%;
        height: 105px;
    }

    .livesplit-logo {
        width: 150px;
        position: absolute;
        opacity: 75%;
        bottom: 11px;
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
</style>
