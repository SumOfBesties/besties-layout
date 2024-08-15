<template>
    <ipl-space>
        <ipl-select
            v-model="videoInputsScene"
            label="Video inputs scene"
            :options="sceneOptions"
        />
        <ipl-select
            v-model="gameLayoutVideoFeedsScene"
            label="Scene for game layout video feeds"
            :options="sceneOptions"
            class="m-t-4"
        />
        <ipl-button
            label="Update"
            class="m-t-8"
            :color="isChanged ? 'red' : 'blue'"
            @click="update"
        />
    </ipl-space>
</template>

<script setup lang="ts">
import { IplButton, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { computed, ref } from 'vue';
import { useObsStore } from 'client-shared/stores/ObsStore';
import { updateRefOnValueChange } from 'client-shared/helpers/StoreHelper';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';

const obsStore = useObsStore();

const sceneOptions = computed(() => obsStore.obsState.scenes?.map(scene => ({
    value: scene,
    name: scene
})) ?? []);

const videoInputsScene = ref('');
const gameLayoutVideoFeedsScene = ref('');
updateRefOnValueChange(() => obsStore.obsConfig.videoInputsScene, videoInputsScene);
updateRefOnValueChange(() => obsStore.obsConfig.gameLayoutVideoFeedsScene, gameLayoutVideoFeedsScene);

const isChanged = computed(() =>
    videoInputsScene.value !== obsStore.obsConfig.videoInputsScene
    || gameLayoutVideoFeedsScene.value !== obsStore.obsConfig.gameLayoutVideoFeedsScene);

async function update() {
    await sendMessage('obs:setConfig', {
        videoInputsScene: videoInputsScene.value,
        gameLayoutVideoFeedsScene: gameLayoutVideoFeedsScene.value
    });
}
</script>
