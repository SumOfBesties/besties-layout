<template>
    <error-display class="m-b-8" />
    <obs-connection-info-settings />
    <obs-scene-settings
        v-if="obsStore.obsState.enabled"
        class="m-t-8"
    />
</template>

<script setup lang="ts">
import ErrorDisplay from '../../components/ErrorDisplay.vue';
import ObsConnectionInfoSettings from './ObsConnectionInfoSettings.vue';
import ObsSceneSettings from './ObsSceneSettings.vue';
import { useObsStore } from 'client-shared/stores/ObsStore';

const obsStore = useObsStore();
</script>
