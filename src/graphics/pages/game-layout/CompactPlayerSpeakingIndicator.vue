<template>
    <span
        class="compact-player-speaking-indicator"
        :class="{ speaking: mixerStore.isSpeaking(props.playerId, props.teamId) }"
    >
        <font-awesome-icon icon="volume-high" />
    </span>
</template>

<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons/faVolumeHigh';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useMixerStore } from 'client-shared/stores/MixerStore';

const mixerStore = useMixerStore();

library.add(faVolumeHigh);

const props = defineProps<{
    playerId: string
    teamId?: string
}>();
</script>

<style scoped lang="scss">
@use '../../styles/colors';

.compact-player-speaking-indicator {
    font-size: 12px;
    width: 22px;
    height: 20px;
    line-height: 21px;
    text-align: center;
    font-weight: 600;
    background-color: colors.$vfd-teal-unlit;
    color: colors.$vfd-background;
    transition: background-color 150ms;

    &.speaking {
        background-color: colors.$vfd-teal;
    }
}
</style>
