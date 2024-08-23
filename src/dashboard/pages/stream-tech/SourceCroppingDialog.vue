<template>
    <ipl-dialog
        v-model:is-open="isOpen"
        class="source-cropping-dialog"
        persistent
    >
        <div
            v-if="loadingScreenshot"
            class="layout horizontal center-horizontal center-vertical"
            style="min-height: 200px;"
        >
            <ipl-spinner color="white" class="m-r-8" /> Loading...
        </div>
        <ipl-message
            v-else-if="screenshotLoadingError != null"
            type="error"
        >
            {{ screenshotLoadingError }}
        </ipl-message>
        <template v-else>
            <div class="zoom-overflow-wrapper">
                <div
                    class="crop-wrapper"
                    ref="cropWrapper"
                    :style="{ '--zoom-factor': zoom }"
                >
                    <div
                        class="crop-outline"
                        :class="{ active: dragStartPosition != null }"
                        :style="{
                        width: cropOutlineData == null || cropWrapperSize == null ? '100%' : `${cropOutlineData.width * cropWrapperSize.width}px`,
                        height: cropOutlineData == null || cropWrapperSize == null ? '100%' : `${cropOutlineData.height * cropWrapperSize.height}px`,
                        transform: cropOutlineData == null || cropWrapperSize == null ? undefined : `translate(${cropOutlineData.left * cropWrapperSize.width}px, ${cropOutlineData.top * cropWrapperSize.height}px)`
                    }"
                        @mousedown="onCropOutlineClick"
                    >
                        <div class="handle top left" />
                        <div class="handle top" />
                        <div class="handle top right" />
                        <div class="handle left" />
                        <div class="handle right" />
                        <div class="handle bottom left" />
                        <div class="handle bottom" />
                        <div class="handle bottom right" />
                    </div>
                    <img
                        :src="sourceScreenshot"
                        @load="onSourceScreenshotLoad"
                    />
                </div>
            </div>
            <div class="m-t-8 cropping-controls">
                <div
                    class="layout horizontal "
                    style="max-width: 600px; margin: 0 auto;"
                >
                    <ipl-button
                        icon="magnifying-glass-plus"
                        @click="zoom = Math.min(10, zoom + 0.5)"
                    />
                    <div class="m-l-8 m-t-8 text-center" style="min-width: 40px">{{ zoom }}x</div>
                    <ipl-button
                        icon="magnifying-glass-minus"
                        class="m-l-8"
                        @click="zoom = Math.max(0.5, zoom - 0.5)"
                    />
                    <ipl-button
                        label="Apply"
                        color="green"
                        class="m-l-8"
                        @click="apply"
                    />
                    <ipl-button
                        label="Reset"
                        color="red"
                        class="m-l-8"
                        @click="resetCrop"
                    />
                    <ipl-button
                        label="Cancel"
                        color="red"
                        class="m-l-8"
                        @click="isOpen = false"
                    />
                </div>
            </div>
        </template>
    </ipl-dialog>
</template>

<script setup lang="ts">
import { IplButton, IplDialog, IplMessage, IplSpinner } from '@iplsplatoon/vue-components';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import { ObsSceneItem } from '../../../extension/services/ObsConnectorService';
import { useObsStore } from 'client-shared/stores/ObsStore';
import cloneDeep from 'lodash/cloneDeep';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassPlus';
import { faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassMinus';

library.add(faMagnifyingGlassPlus, faMagnifyingGlassMinus);

type CropOutlineData = { width: number, height: number, top: number, left: number };

const cropWrapper = ref<HTMLDataElement | null>();

const obsStore = useObsStore();
const isOpen = ref(false);
const selectedSourceName = ref<string | null>(null);
const loadingScreenshot = ref(false);
const sourceScreenshot = ref('');
const screenshotLoadingError = ref<string | null>(null);
const sceneItem = ref<ObsSceneItem | null>(null);

const cropOutlineData = ref<CropOutlineData | null>(null);
const initialCropOutline = ref<CropOutlineData | null>(null);
const dragSideX = ref<'left' | 'right' | null>(null);
const dragSideY = ref<'top' | 'bottom' | null>(null);
const dragStartPosition = ref<{ x: number, y: number } | null>(null);
const cropWrapperSize = ref<{ width: number, height: number } | null>(null);
const zoom = ref(1);

function resetCrop() {
    cropOutlineData.value = {
        width: 1,
        height: 1,
        top: 0,
        left: 0
    }
}

watch(isOpen, async (newValue) => {
    const gameLayoutVideoFeedsScene = obsStore.obsConfig.gameLayoutVideoFeedsScene;
    if (gameLayoutVideoFeedsScene != null && newValue && selectedSourceName.value != null) {
        sourceScreenshot.value = '';
        loadingScreenshot.value = true;
        zoom.value = 1;
        try {
            const sceneItemData = await Promise.all([
                sendMessage('obs:getSourceScreenshot', { sourceName: selectedSourceName.value }),
                sendMessage('obs:getSceneItem', { sceneName: gameLayoutVideoFeedsScene, sourceName: selectedSourceName.value })
            ]);
            screenshotLoadingError.value = null;
            sourceScreenshot.value = sceneItemData[0];
            sceneItem.value = sceneItemData[1];
            const sceneItemTransform = sceneItemData[1].sceneItemTransform;
            cropOutlineData.value = {
                width: ((sceneItemTransform.sourceWidth - sceneItemTransform.cropLeft - sceneItemTransform.cropRight) / sceneItemTransform.sourceWidth),
                height: ((sceneItemTransform.sourceHeight - sceneItemTransform.cropTop - sceneItemTransform.cropBottom) / sceneItemTransform.sourceHeight),
                left: (sceneItemTransform.cropLeft / sceneItemTransform.sourceWidth),
                top: (sceneItemTransform.cropTop / sceneItemTransform.sourceHeight)
            }
            loadingScreenshot.value = false;
            await nextTick();
        } catch (e) {
            screenshotLoadingError.value = 'message' in e ? e.message : String(e);
            loadingScreenshot.value = false;
        }
    }
});

function onSourceScreenshotLoad() {
    if (cropWrapper.value != null) {
        cropWrapperSize.value = { width: cropWrapper.value.clientWidth, height: cropWrapper.value.clientHeight };
    } else {
        cropWrapperSize.value = null;
    }
}

function onCropOutlineClick(e: PointerEvent) {
    const classList = (e.target as HTMLElement).classList;
    if (!classList.contains('handle')) return;

    dragStartPosition.value = { y: e.clientY, x: e.clientX };
    initialCropOutline.value = cloneDeep(cropOutlineData.value);

    if (classList.contains('right')) {
        dragSideX.value = 'right';
    } else if (classList.contains('left')) {
        dragSideX.value = 'left';
    } else {
        dragSideX.value = null;
    }

    if (classList.contains('top')) {
        dragSideY.value = 'top';
    } else if (classList.contains('bottom')) {
        dragSideY.value = 'bottom';
    } else {
        dragSideY.value = null;
    }

    const cropWrapper = (e.target as HTMLElement).parentElement?.parentElement;
    if (cropWrapper != null) {
        cropWrapperSize.value = { width: cropWrapper.clientWidth, height: cropWrapper.clientHeight };
    } else {
        cropWrapperSize.value = null;
    }
}

function onWindowMouseup() {
    dragSideX.value = null;
    dragSideY.value = null;
    dragStartPosition.value = null;
}
function onWindowMouseMove(e: PointerEvent) {
    if (dragStartPosition.value == null || cropWrapperSize.value == null || initialCropOutline.value == null) return;
    const newCropOutline = cloneDeep(initialCropOutline.value);
    if (dragSideX.value === 'right') {
        newCropOutline.width = Math.min(1 - newCropOutline.left, Math.max(0, newCropOutline.width - (dragStartPosition.value.x - e.clientX) / zoom.value / cropWrapperSize.value.width));
    } else if (dragSideX.value === 'left') {
        newCropOutline.width = Math.min(newCropOutline.left + newCropOutline.width, Math.max(0, newCropOutline.width + (dragStartPosition.value.x - e.clientX) / zoom.value / cropWrapperSize.value.width));
        newCropOutline.left = Math.min(initialCropOutline.value.width + initialCropOutline.value.left, Math.max(0, newCropOutline.left - (dragStartPosition.value.x - e.clientX) / zoom.value / cropWrapperSize.value.width));
    }
    if (dragSideY.value === 'bottom') {
        newCropOutline.height = Math.min(1 - newCropOutline.top, Math.max(0, newCropOutline.height - (dragStartPosition.value.y - e.clientY) / zoom.value / cropWrapperSize.value.height));
    } else if (dragSideY.value === 'top') {
        newCropOutline.height = Math.min(newCropOutline.top + newCropOutline.height, Math.max(0, newCropOutline.height + (dragStartPosition.value.y - e.clientY) / zoom.value / cropWrapperSize.value.height));
        newCropOutline.top = Math.min(initialCropOutline.value.height + initialCropOutline.value.top, Math.max(0, newCropOutline.top - (dragStartPosition.value.y - e.clientY) / zoom.value / cropWrapperSize.value.height));
    }
    cropOutlineData.value = newCropOutline;
}
onMounted(() => {
    window.document.addEventListener('mouseup', onWindowMouseup);
    window.document.addEventListener('mousemove', onWindowMouseMove);
});
onUnmounted(() => {
    window.document.removeEventListener('mouseup', onWindowMouseup);
    window.document.removeEventListener('mousemove', onWindowMouseMove);
});

function open(sourceName: string) {
    selectedSourceName.value = sourceName;
    isOpen.value = true;
}

async function apply() {
    try {
        const gameLayoutVideoFeedsScene = obsStore.obsConfig.gameLayoutVideoFeedsScene;
        if (sceneItem.value == null || cropOutlineData.value == null || gameLayoutVideoFeedsScene == null) return;
        const height = sceneItem.value.sceneItemTransform.sourceHeight;
        const width = sceneItem.value.sceneItemTransform.sourceWidth;
        await sendMessage('obs:setSceneItemCrop', {
            sceneItemId: sceneItem.value.sceneItemId,
            sceneName: gameLayoutVideoFeedsScene,
            crop: {
                cropTop: Math.round(cropOutlineData.value.top * height),
                cropBottom: Math.round((1 - cropOutlineData.value.top - cropOutlineData.value.height) * height),
                cropLeft: Math.round(cropOutlineData.value.left * width),
                cropRight: Math.round((1 - cropOutlineData.value.left - cropOutlineData.value.width) * width)
            }
        });
    } finally {
        isOpen.value = false;
    }
}

defineExpose({
    open
});
</script>

<style lang="scss">
.source-cropping-dialog {
    width: 90vw;
    height: 90vh;
    overflow: hidden !important;

    > .content {
        box-sizing: border-box;
        overflow: hidden;
    }
}
</style>

<style scoped lang="scss">
.cropping-controls {
    position: sticky;
    left: 0;
    bottom: 0;
}

.zoom-overflow-wrapper {
    height: calc(90vh - 65px);
    width: calc(90vw - 50px);
    margin: 0 auto;
    overflow: auto;
}

.crop-wrapper {
    position: relative;
    border: 1px solid var(--ipl-input-color);
    box-sizing: border-box;
    width: max-content;
    margin: 0 auto;
    zoom: var(--zoom-factor);

    img {
        height: 80vh;
        user-select: none;
        image-rendering: pixelated;
    }

    .crop-outline {
        box-sizing: border-box;
        border: calc(1px / var(--zoom-factor)) solid red;
        position: absolute;
        top: -1.5px;
        left: 0;
        user-select: none;

        &.active > .handle {
            opacity: 0.25;
        }
    }

    .handle {
        position: absolute;
        width: calc(10px / var(--zoom-factor));
        height: calc(10px / var(--zoom-factor));
        background-color: red;
        left: 50%;
        top: 50%;
        user-select: none;
    }
    .handle.top {
        top: 0;
        transform: translate(-50%, -50%);
        cursor: ns-resize;
    }
    .handle.bottom {
        top: unset;
        bottom: 0;
        transform: translate(-50%, 50%);
        cursor: ns-resize;
    }
    .handle.left {
        left: 0;
        transform: translate(-50%, -50%);
        cursor: ew-resize;
    }
    .handle.right {
        left: unset;
        right: 0;
        transform: translate(50%, -50%);
        cursor: ew-resize;
    }
    .handle.top.left {
        cursor: nwse-resize;
    }
    .handle.bottom.right {
        transform: translate(50%, 50%);
        cursor: nwse-resize;
    }
    .handle.top.right {
        transform: translate(50%, -50%);
        cursor: nesw-resize;
    }
    .handle.bottom.left {
        transform: translate(-50%, 50%);
        cursor: nesw-resize;
    }
}
</style>
