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
                        <div
                            v-if="selectedCapture?.type === 'camera'"
                            class="input-slot-crop-preview"
                            :style="{
                                width: selectedSlotCropPreviewData == null ? '100%' : `${selectedSlotCropPreviewData.width * 100}%`,
                                height: selectedSlotCropPreviewData == null ? '100%' : `${selectedSlotCropPreviewData.height * 100}%`
                            }"
                        />
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
            <div class="m-t-8 cropping-controls layout vertical center-horizontal">
                <div
                    class="layout horizontal max-width center-vertical center-horizontal"
                >
                    <ipl-radio
                        v-model="selectedAspectRatio"
                        :options="aspectRatioOptions"
                        name="aspect-ratio"
                        label="Lock aspect ratio"
                        style="min-width: 200px; margin-top: -8px;"
                    />
                    <ipl-button
                        class="m-l-8"
                        style="max-width: 200px;"
                        @click="centerHorizontal"
                    >
                        <font-awesome-icon icon="left-right" fixed-width />
                        Center horizontal
                    </ipl-button>
                    <ipl-button
                        class="m-l-8"
                        style="max-width: 200px;"
                        @click="centerVertical"
                    >
                        <font-awesome-icon icon="up-down" fixed-width />
                        Center vertical
                    </ipl-button>
                </div>
                <div
                    class="layout horizontal max-width center-horizontal"
                    style="max-width: 850px; margin: 8px 0 auto;"
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
                        style="max-width: 100px"
                        @click="apply"
                    />
                    <ipl-button
                        label="Reset"
                        color="red"
                        class="m-l-8"
                        style="max-width: 100px"
                        @click="resetCrop"
                    />
                    <ipl-button
                        label="Cancel"
                        color="red"
                        class="m-l-8"
                        style="max-width: 100px"
                        @click="isOpen = false"
                    />
                </div>
            </div>
        </template>
    </ipl-dialog>
</template>

<script setup lang="ts">
import { IplButton, IplDialog, IplMessage, IplRadio, IplSpinner } from '@iplsplatoon/vue-components';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import { ObsSceneItem } from '../../../extension/services/ObsConnectorService';
import { useObsStore } from 'client-shared/stores/ObsStore';
import cloneDeep from 'lodash/cloneDeep';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassPlus';
import { faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassMinus';
import { faUpDown } from '@fortawesome/free-solid-svg-icons/faUpDown';
import { faLeftRight } from '@fortawesome/free-solid-svg-icons/faLeftRight';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faMagnifyingGlassPlus, faMagnifyingGlassMinus, faUpDown, faLeftRight);

type CropOutlineData = { width: number, height: number, top: number, left: number };

const cropWrapper = ref<HTMLDataElement | null>();

const selectedAspectRatio = ref('off');
const aspectRatioOptions = [
    { name: 'Off', value: 'off' },
    { name: '16:9', value: '169' },
    { name: '4:3', value: '43' },
    { name: '3:2', value: '32' },
    { name: '2:1', value: '21' }
];
function getNumericAspectRatio() {
    switch (selectedAspectRatio.value) {
        case '169':
            return 16 / 9;
        case '43':
            return 4 / 3;
        case '32':
            return 3 / 2;
        case '21':
            return 2;
        default:
            return null;
    }
}
watch(selectedAspectRatio, () => {
    const numericAspectRatio = getNumericAspectRatio();
    if (numericAspectRatio == null || cropOutlineData.value == null || sceneItem.value == null) return;
    const sourceAspectRatio = sceneItem.value.sceneItemTransform.sourceWidth / sceneItem.value.sceneItemTransform.sourceHeight;
    if (sourceAspectRatio < numericAspectRatio) {
        const newHeight = cropOutlineData.value.width / numericAspectRatio * sourceAspectRatio;
        cropOutlineData.value = {
            ...cropOutlineData.value,
            height: newHeight,
            top: Math.min(cropOutlineData.value.top, 1 - newHeight)
        };
    } else {
        const newWidth = cropOutlineData.value.height * numericAspectRatio / sourceAspectRatio;
        cropOutlineData.value = {
            ...cropOutlineData.value,
            width: newWidth,
            left: Math.min(cropOutlineData.value.left, 1 - newWidth)
        };
    }
});

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

const selectedCapture = ref<{ type: 'camera' | 'game', index: number } | null>(null);
const selectedSlotCropPreviewData = computed(() => {
    if (
        selectedCapture.value == null
        || selectedCapture.value.type !== 'camera'
        || cropOutlineData.value == null
        || cropWrapperSize.value == null
    ) return;
    const inputSlotPosition = obsStore.obsVideoInputPositions[`${selectedCapture.value.type}Captures`][selectedCapture.value.index];
    if (inputSlotPosition == null) return null;

    const f = inputSlotPosition.width / inputSlotPosition.height;
    const c = (cropOutlineData.value.width * cropWrapperSize.value.width) / (cropOutlineData.value.height * cropWrapperSize.value.height);
    const fc = f / c;
    if (fc === 1) {
        return {
            height: 1,
            width: 1
        };
    } else if (fc > 1) {
        return {
            height: 1 / fc,
            width: 1
        };
    } else {
        return {
            width: fc,
            height: 1
        };
    }
});

function resetCrop() {
    cropOutlineData.value = {
        width: 1,
        height: 1,
        top: 0,
        left: 0
    }
    selectedAspectRatio.value = 'off';
}

watch(isOpen, async (newValue) => {
    const gameLayoutVideoFeedsScene = obsStore.obsConfig.gameLayoutVideoFeedsScene;
    if (gameLayoutVideoFeedsScene != null && newValue && selectedSourceName.value != null) {
        sourceScreenshot.value = '';
        loadingScreenshot.value = true;
        zoom.value = 1;
        selectedAspectRatio.value = 'off';
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
    if (dragStartPosition.value == null || cropWrapperSize.value == null || initialCropOutline.value == null || sceneItem.value == null) return;
    const aspectRatio = getNumericAspectRatio();
    const newCropOutline = cloneDeep(initialCropOutline.value);

    // i hate this logic with a passion but it _works_ so i'm not gonna touch it any further; i've got an event to run...

    if (aspectRatio == null) {
        // handle dragging with no aspect ratio constraints
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
    } else {
        // handle dragging WITH aspect ratio constraints
        const sourceAspectRatio = sceneItem.value.sceneItemTransform.sourceWidth / sceneItem.value.sceneItemTransform.sourceHeight;
        if (dragSideX.value != null) {
            if (dragSideX.value === 'left') {
                newCropOutline.left = Math.min(initialCropOutline.value.width + initialCropOutline.value.left, Math.max(0, newCropOutline.left - (dragStartPosition.value.x - e.clientX) / zoom.value / cropWrapperSize.value.width))
                newCropOutline.width = Math.min(initialCropOutline.value.left + initialCropOutline.value.width, Math.max(0, newCropOutline.width + (dragStartPosition.value.x - e.clientX) / zoom.value / cropWrapperSize.value.width));
            } else {
                newCropOutline.width = Math.min(1 - newCropOutline.left, Math.max(0, newCropOutline.width - (dragStartPosition.value.x - e.clientX) / zoom.value / cropWrapperSize.value.width));
            }
            newCropOutline.height = newCropOutline.width / aspectRatio * sourceAspectRatio;
            if (dragSideY.value === 'top') {
                newCropOutline.top = newCropOutline.top - (newCropOutline.height - initialCropOutline.value.height);
            } else if (dragSideY.value == null) {
                newCropOutline.top = newCropOutline.top - (newCropOutline.height - initialCropOutline.value.height) / 2;
            }
            if (newCropOutline.height + newCropOutline.top > 1) {
                if (dragSideY.value == null) {
                    const remainingInitialHeight = 1 - (initialCropOutline.value.top + initialCropOutline.value.height);
                    newCropOutline.top = initialCropOutline.value.top - remainingInitialHeight;
                    newCropOutline.height = initialCropOutline.value.height + remainingInitialHeight * 2;
                    if (dragSideX.value === 'left') {
                        newCropOutline.left = initialCropOutline.value.left - remainingInitialHeight * 2;
                    }
                } else {
                    newCropOutline.height = 1 - newCropOutline.top;
                }
                newCropOutline.width = newCropOutline.height * aspectRatio / sourceAspectRatio;
                if (dragSideY.value === 'bottom' && dragSideX.value === 'left') {
                    newCropOutline.left = initialCropOutline.value.left - (newCropOutline.width - initialCropOutline.value.width);
                }
            } else if (newCropOutline.top < 0) {
                if (dragSideY.value == null) {
                    newCropOutline.height = newCropOutline.height + newCropOutline.top * 2;
                } else {
                    newCropOutline.height = newCropOutline.height + newCropOutline.top;
                }
                newCropOutline.width = newCropOutline.height * aspectRatio / sourceAspectRatio;
                if (dragSideY.value === 'bottom') {
                    newCropOutline.top = initialCropOutline.value.top;
                } else {
                    newCropOutline.top = 0;
                    if (dragSideX.value === 'left') {
                        newCropOutline.left = initialCropOutline.value.left - (newCropOutline.width - initialCropOutline.value.width);
                    }
                }
            }
        } else {
            if (dragSideY.value === 'top') {
                newCropOutline.height = Math.min(initialCropOutline.value.top + initialCropOutline.value.height, Math.max(0, newCropOutline.height + ((dragStartPosition.value.y - e.clientY)) / zoom.value / cropWrapperSize.value.height));
                newCropOutline.top = Math.max(0, newCropOutline.top - (newCropOutline.height - initialCropOutline.value.height));
            } else {
                newCropOutline.height = Math.min(1 - initialCropOutline.value.top, Math.max(0, newCropOutline.height - ((dragStartPosition.value.y - e.clientY)) / zoom.value / cropWrapperSize.value.height));
            }
            newCropOutline.width = newCropOutline.height / (1 / aspectRatio) * (1 / sourceAspectRatio);
            newCropOutline.left = newCropOutline.left - (newCropOutline.width - initialCropOutline.value.width) / 2;

            if (newCropOutline.left < 0 || newCropOutline.left + newCropOutline.width > 1) {
                let remainingSpace: number;
                if (newCropOutline.left < 0) {
                    newCropOutline.left = 0;
                    remainingSpace = initialCropOutline.value.left;
                } else {
                    remainingSpace = 1 - (initialCropOutline.value.width + initialCropOutline.value.left);
                    newCropOutline.left = initialCropOutline.value.left - remainingSpace;
                }

                newCropOutline.width = initialCropOutline.value.width + remainingSpace * 2;
                newCropOutline.height = newCropOutline.width * (1 / aspectRatio) / (1 / sourceAspectRatio);
                if (dragSideY.value === 'top') {
                    newCropOutline.top = initialCropOutline.value.top - (newCropOutline.height - initialCropOutline.value.height);
                }
            }
        }
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

function centerHorizontal() {
    if (cropOutlineData.value == null) return;
    cropOutlineData.value.left = (1 - cropOutlineData.value.width) / 2;
}

function centerVertical() {
    if (cropOutlineData.value == null) return;
    cropOutlineData.value.top = (1 - cropOutlineData.value.height) / 2;
}

function open(sourceName: string, selectedCaptureData: { type: 'camera' | 'game', index: number }) {
    selectedCapture.value = selectedCaptureData;
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
    height: calc(90vh - 115px);
    width: calc(90vw - 50px);
    margin: 0 auto;
    overflow: auto;
}

.input-slot-crop-preview {
    position: absolute;
    border: calc(1px / var(--zoom-factor)) solid green;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
}

.crop-wrapper {
    position: relative;
    border: 1px solid var(--ipl-input-color);
    box-sizing: border-box;
    width: max-content;
    margin: 0 auto;
    zoom: var(--zoom-factor);

    img {
        height: calc(90vh - 125px);
        user-select: none;
        pointer-events: none;
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
