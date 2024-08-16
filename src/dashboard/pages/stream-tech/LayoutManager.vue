<template>
    <div>
        <ipl-space>
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
        <ipl-space class="m-t-8">
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
                    :class="{ active: selectedCapture != null && selectedCapture.type === 'camera' && selectedCapture.index === i - 1 }"
                    @click="selectCapture('camera', i - 1)"
                >
                    <font-awesome-icon icon="video" fixed-width /><span class="capture-index">{{ i }}</span>
                </div>
                <div
                    v-for="i in selectedLayoutData.gameCaptureCount"
                    class="capture"
                    :style="{ gridArea: `game-${i}` }"
                    :class="{ active: selectedCapture != null && selectedCapture.type === 'game' && selectedCapture.index === i - 1 }"
                    @click="selectCapture('game', i - 1)"
                >
                    <font-awesome-icon icon="gamepad" fixed-width /><span class="capture-index">{{ i }}</span>
                </div>
            </div>
            <template v-if="selectedCapture != null">
                <div class="title m-t-8">Video input for {{ selectedCapture.type }} capture #{{ selectedCapture.index + 1 }}</div>
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
            </template>
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

function setVideoFeedAssignment(sourceName: string) {
    if (selectedCapture.value == null) return;
    const newAssignments = cloneDeep(selectedCapture.value.type === 'game'
        ? obsStore.obsVideoInputAssignments.gameCaptures
        : obsStore.obsVideoInputAssignments.cameraCaptures);
    const oldLength = newAssignments.length;
    newAssignments[selectedCapture.value.index] = sourceName;
    if (oldLength - 1 < selectedCapture.value.index) {
        newAssignments.fill(null, oldLength, selectedCapture.value.index);
    }
    obsStore.setVideoInputAssignments(selectedCapture.value.type, newAssignments);
}
</script>

<style scoped lang="scss">
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

        > .capture-index {
            margin-left: 4px;
        }
    }
}
</style>
