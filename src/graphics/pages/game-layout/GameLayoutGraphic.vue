<template>
    <div class="game-layout-wrapper">
        <component
            :is="gameLayoutComponentMap[obsStore.activeGameLayout as typeof layoutKeys[number]] ?? gameLayoutComponentMap['16x9-1g1c']"
        />
    </div>
</template>

<script setup lang="ts">
import { layoutKeys, layouts } from 'types/Layouts';
import { type Component, nextTick, onMounted, watch } from 'vue';
import Layout_16x9_1g1c from './layouts/Layout_16x9_1g1c.vue';
import Layout_16x9_2g1c from './layouts/Layout_16x9_2g1c.vue';
import { useObsStore } from 'client-shared/stores/ObsStore';
import range from 'lodash/range';
import { ObsVideoInputPositions } from 'types/schemas';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import Layout_4x3_1g1c from './layouts/Layout_4x3_1g1c.vue';
import Layout_4x3_2g1c from './layouts/Layout_4x3_2g1c.vue';
import Layout_4x3_3g1c from './layouts/Layout_4x3_3g1c.vue';
import Layout_4x3_4g1c from './layouts/Layout_4x3_4g1c.vue';

const obsStore = useObsStore();

const gameLayoutComponentMap: Record<typeof layoutKeys[number], Component> = {
    '16x9-1g1c': Layout_16x9_1g1c,
    '16x9-2g1c': Layout_16x9_2g1c,
    '4x3-1g1c': Layout_4x3_1g1c,
    '4x3-2g1c': Layout_4x3_2g1c,
    '4x3-3g1c': Layout_4x3_3g1c,
    '4x3-4g1c': Layout_4x3_4g1c
};

onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('is-layout-leader')) {
        watch(() => obsStore.activeGameLayout, async (newValue) => {
            await nextTick();
            const layoutMeta = layouts[newValue as typeof layoutKeys[number]];
            if (layoutMeta == null) return;

            const capturePositions: ObsVideoInputPositions = {
                gameCaptures: [],
                cameraCaptures: []
            }

            const findCaptures = (type: 'game' | 'camera') => {
                const captureCount = type === 'game' ? layoutMeta.gameCaptureCount : layoutMeta.cameraCaptureCount;
                const captures = Array.from(document.querySelectorAll(type === 'game' ? '.game-capture' : '.camera-capture'));
                range(captureCount).forEach(captureIndex => {
                    const captureAtIndex = captures.find(capture => (capture as HTMLElement).dataset.captureIndex === String(captureIndex)) as HTMLElement | undefined;
                    if (captureAtIndex == null) {
                        sendMessage('log:warning', `Layout ${newValue} - Cannot find ${type} capture at index ${captureIndex}`);
                        return;
                    }
                    const boundingRect = captureAtIndex.getBoundingClientRect();
                    capturePositions[type === 'game' ? 'gameCaptures' : 'cameraCaptures'].push({
                        x: boundingRect.x,
                        y: boundingRect.y,
                        width: captureAtIndex.clientWidth,
                        height: captureAtIndex.clientHeight
                    });
                });
            }

            findCaptures('game');
            findCaptures('camera');

            const playerNameplates = Array.from(document.querySelectorAll('.player-nameplate'));
            range(layoutMeta.playerNameplateCount).forEach(playerNameplateIndex => {
                const nameplateAtIndex = playerNameplates.find(nameplate => (nameplate as HTMLElement).dataset.nameplateIndex === String(playerNameplateIndex));
                if (nameplateAtIndex == null) {
                    sendMessage('log:warning', `Layout ${newValue} - Cannot find nameplate at index ${playerNameplateIndex}`);
                }
            });

            obsStore.setVideoInputPositions(capturePositions);
        }, { immediate: true });
    }
});
</script>

<style scoped lang="scss">
@use '../../styles/constants';

.game-layout-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px - constants.$omnibarHeight;
}
</style>
