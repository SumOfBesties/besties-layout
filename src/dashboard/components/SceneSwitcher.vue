<template>
    <ipl-space>
        <ipl-button
            label="Switch to gameplay"
            :disabled="!shouldAllowSceneSwitch(obsStore.obsConfig.gameplayScene)"
            @click="switchScene(obsStore.obsConfig.gameplayScene)"
        />
        <ipl-button
            class="m-t-8"
            label="Switch to intermission"
            :disabled="!shouldAllowSceneSwitch(obsStore.obsConfig.intermissionScene)"
            color="red"
            @click="switchScene(obsStore.obsConfig.intermissionScene)"
        />
    </ipl-space>
</template>

<script setup lang="ts">
import { IplButton, IplSpace } from '@iplsplatoon/vue-components';
import { useObsStore } from 'client-shared/stores/ObsStore';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';

const obsStore = useObsStore();

function shouldAllowSceneSwitch(sceneName?: string | null) {
    return sceneName != null && obsStore.obsState.status === 'CONNECTED' && obsStore.obsState.currentScene !== sceneName;
}

async function switchScene(sceneName?: string | null) {
    if (!sceneName) return;
    await sendMessage('obs:setCurrentScene', { sceneName });
}
</script>
