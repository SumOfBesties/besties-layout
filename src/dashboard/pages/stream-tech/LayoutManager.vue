<template>
    <div class="layout-manager">
        <div style="position: relative; max-height: 100%; opacity: 1">
            <transition name="capture-select-reveal">
                <ipl-space
                    v-if="selectedCapture != null"
                    class="capture-select"
                >
                    <div class="title">Video input for {{ selectedCapture.type }} capture #{{ selectedCapture.index + 1 }}</div>
                    <ipl-space
                        v-for="input in obsStore.obsState.videoInputs ?? []"
                        :key="input.sourceName"
                        :color="obsStore.obsVideoInputAssignments[selectedCapture.type === 'game' ? 'gameCaptures' : 'cameraCaptures'][selectedCapture.index] === input.sourceName ? 'blue' : 'secondary'"
                        class="m-t-8"
                        clickable
                        @click="setVideoFeedAssignment(input.sourceName)"
                    >
                        {{ input.sourceName }}
                    </ipl-space>
                </ipl-space>
            </transition>

            <ipl-space
                style="overflow-y: auto; height: 100%; box-sizing: border-box; transition: opacity 250ms"
                :style="{ opacity: selectedCapture == null ? '1' : '0.25' }"
            >
                <ipl-space
                    v-for="(layout, key) in layouts"
                    :color="activeGameLayout === key ? 'blue' : 'secondary'"
                    :key="key"
                    class="layout-item"
                    clickable
                    @click="obsStore.setActiveGameLayout(key)"
                >
                    <div class="layout-name">{{ layout.name }}</div>
                    <div class="layout-stats">
                        <font-awesome-icon icon="video" fixed-width /> {{ layout.cameraCaptureCount }}
                        <font-awesome-icon icon="gamepad" fixed-width /> {{ layout.gameCaptureCount }}
                    </div>
                </ipl-space>
            </ipl-space>
        </div>
        <ipl-space>
            <div
                v-if="selectedLayoutData != null"
                class="layout-preview"
                :style="{
                    gridTemplateAreas: selectedLayoutData.preview.gridTemplateAreas,
                    gridTemplateColumns: selectedLayoutData.preview.gridTemplateColumns,
                    gridTemplateRows: selectedLayoutData.preview.gridTemplateRows
                }"
            >
                <div
                    v-for="i in selectedLayoutData.cameraCaptureCount"
                    class="capture"
                    :style="{ gridArea: `cam-${i}` }"
                    :class="{
                        active: selectedCapture != null && selectedCapture.type === 'camera' && selectedCapture.index === i - 1,
                        unassigned: !isAssignedInput(obsStore.obsVideoInputAssignments.cameraCaptures[i - 1])
                    }"
                    @click="selectCapture('camera', i - 1)"
                >
                    <div><font-awesome-icon icon="video" fixed-width /><span class="capture-index">{{ i }}</span></div>
                </div>
                <div
                    v-for="i in selectedLayoutData.gameCaptureCount"
                    class="capture"
                    :style="{ gridArea: `game-${i}` }"
                    :class="{
                        active: selectedCapture != null && selectedCapture.type === 'game' && selectedCapture.index === i - 1,
                        unassigned: !isAssignedInput(obsStore.obsVideoInputAssignments.gameCaptures[i - 1])
                    }"
                    @click="selectCapture('game', i - 1)"
                >
                    <div><font-awesome-icon icon="gamepad" fixed-width /><span class="capture-index">{{ i }}</span></div>
                </div>
            </div>
        </ipl-space>
    </div>
</template>

<script setup lang="ts">
import { IplSpace } from '@iplsplatoon/vue-components';
import { layouts } from 'types/Layouts';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo';
import { faGamepad } from '@fortawesome/free-solid-svg-icons/faGamepad';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, ref } from 'vue';
import { useObsStore } from 'client-shared/stores/ObsStore';
import cloneDeep from 'lodash/cloneDeep';
import { updateRefOnValueChange } from 'client-shared/helpers/StoreHelper';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';

library.add(faVideo, faGamepad);

const obsStore = useObsStore();
const scheduleStore = useScheduleStore();

const activeGameLayout = ref<keyof typeof layouts | ''>('');
const selectedLayoutData = computed(() => activeGameLayout.value === '' ? null : layouts[activeGameLayout.value]);
updateRefOnValueChange(() => obsStore.activeGameLayout, activeGameLayout);

const selectedCapture = ref<{ type: 'camera' | 'game', index: number } | null>(null);

function selectCapture(type: 'camera' | 'game', index: number) {
    if (selectedCapture.value != null && type === selectedCapture.value.type && index === selectedCapture.value.index) {
        selectedCapture.value = null;
        return;
    }

    selectedCapture.value = { type, index };
}

function isAssignedInput(sourceName?: string | null) {
    return sourceName != null
        && obsStore.obsState.videoInputs != null
        && obsStore.obsState.videoInputs.some(input => input.sourceName === sourceName);
}

function setVideoFeedAssignment(sourceName: string) {
    if (selectedCapture.value == null) return;
    const newAssignments = cloneDeep(selectedCapture.value.type === 'game'
        ? obsStore.obsVideoInputAssignments.gameCaptures
        : obsStore.obsVideoInputAssignments.cameraCaptures);
    const oldLength = newAssignments.length;
    if (newAssignments[selectedCapture.value.index] === sourceName) {
        newAssignments[selectedCapture.value.index] = null;
    } else {
        newAssignments[selectedCapture.value.index] = sourceName;
    }
    if (oldLength - 1 < selectedCapture.value.index) {
        newAssignments.fill(null, oldLength, selectedCapture.value.index);
    }
    obsStore.setVideoInputAssignments(selectedCapture.value.type, newAssignments);
}
</script>

<style scoped lang="scss">
.layout-manager {
    overflow-y: hidden;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    row-gap: 8px;
}

.layout-item {
    display: grid !important;
    grid-template-columns: 1fr auto;

    &:not(:last-child) {
        margin-bottom: 8px;
    }
}

.layout-stats {
    font-weight: 700;
}

.layout-preview {
    aspect-ratio: 2 / 1;
    width: 100%;
    display: grid;
    gap: 2px;
    border: 1px solid var(--ipl-input-color);
    padding: 2px;
    box-sizing: border-box;

    > .capture {
        background-color: rgba(34, 34, 34, 0.5);
        border: 1px solid var(--ipl-input-color);
        transition: border-color 100ms;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        user-select: none;

        &:hover {
            border-color: var(--ipl-input-color-hover);
        }

        &:active, &.active {
            border-color: var(--ipl-input-color-focus);
        }

        &.active {
            background-color: rgba(68, 68, 68, 0.5);
        }

        &.unassigned {
            color: #e74e36;
        }

        .capture-index {
            margin-left: 4px;
        }
    }
}

.capture-select {
    position: absolute;
    width: calc(100% - 8px);
    max-height: calc(100% - 8px);
    bottom: 4px;
    left: 4px;
    overflow-y: auto;
    box-sizing: border-box;
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.25));
    transform: translateY(0);
    opacity: 1;
    z-index: 2;
}

.capture-select-reveal-enter-active,
.capture-select-reveal-leave-active {
    transition-duration: 150ms;
    transition-property: transform, opacity;
    transition-timing-function: ease-in-out;
}
.capture-select-reveal-leave-from,
.capture-select-reveal-enter-to {
    transform: translateY(0);
    opacity: 1;
}
.capture-select-reveal-leave-to {
    transform: translateY(16px);
    opacity: 0;
}
.capture-select-reveal-enter-from {
    transform: translateY(-16px);
    opacity: 0;
}
</style>
