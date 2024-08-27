<template>
    <canvas
        ref="equalizerCanvas"
    />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useMixerEQStore } from 'client-shared/stores/MixerEQStore';
import { DISPLAYED_MIXER_EQ_CHANNEL_COUNT } from '../../../shared/MixerHelpers';
import { colors } from '../../styles/colors';

const equalizerCanvas = ref<HTMLCanvasElement>();

const mixerEQStore = useMixerEQStore();

onMounted(() => {
    const canvas = equalizerCanvas.value;
    if (canvas == null) {
        console.warn('Mounted IntermissionEqualizer with no canvas?');
        return;
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    if (ctx == null) {
        console.warn('Received no canvas context');
        return;
    }

    const canvasScale = 2;
    const resizeObserver = new ResizeObserver(entries => {
        if (entries.length !== 1) return;
        width = entries[0].contentRect.width;
        height = entries[0].contentRect.height;
        canvas.width = entries[0].contentRect.width * canvasScale;
        canvas.height = entries[0].contentRect.height * canvasScale;
        ctx.scale(canvasScale, canvasScale);
    });
    resizeObserver.observe(canvas);
    onUnmounted(() => {
        resizeObserver.disconnect();
    });

    let lastTime = 0;
    let currentLevels: number[] = [];
    let targetLevels: number[] = [];

    watch(() => mixerEQStore.mixerEQLevels, newValue => {
        targetLevels = newValue.map(level => Math.min(100, Math.abs(level)) / 100);
    });

    const channelSegmentHeight = 5;
    const channelSegmentSpacing = 3;
    const channelSpacing = 3;

    const redraw = (time: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const deltaTime = time - lastTime;
        lastTime = time;
        for (let i = 0; i < DISPLAYED_MIXER_EQ_CHANNEL_COUNT; i++) {
            const targetLevel = targetLevels[i] ?? 0;
            const currentLevel = currentLevels[i] ?? 0;
            if (currentLevel > targetLevel) {
                currentLevels[i] = Math.max(targetLevel, currentLevel - deltaTime / 250);
            } else if (currentLevel < targetLevel) {
                currentLevels[i] = Math.min(targetLevel, currentLevel + deltaTime / 250);
            }
        }

        const channelSegmentCount = Math.floor((height + channelSegmentSpacing) / (channelSegmentHeight + channelSegmentSpacing));
        const yOffset = height - ((channelSegmentSpacing + channelSegmentHeight) * channelSegmentCount);
        const channelSegmentWidth = width / DISPLAYED_MIXER_EQ_CHANNEL_COUNT;

        for (let i = 0; i < DISPLAYED_MIXER_EQ_CHANNEL_COUNT; i++) {
            const channelLevel = currentLevels[i] ?? 0;
            const litSegmentCount = Math.round(channelSegmentCount * channelLevel);

            for (let j = 0; j < channelSegmentCount; j++) {
                if (channelSegmentCount - j <= litSegmentCount) {
                    ctx.fillStyle = colors.vfdTeal;
                } else {
                    ctx.fillStyle = colors.vfdTealUnlit;
                }

                ctx.beginPath();
                ctx.roundRect(
                    channelSegmentWidth * i,
                    j * (channelSegmentHeight + channelSegmentSpacing) + yOffset,
                    channelSegmentWidth - channelSpacing,
                    channelSegmentHeight,
                    channelSegmentHeight / 2);
                ctx.fill();
            }
        }

        requestAnimationFrame(redraw);
    }

    redraw(0);
});
</script>

<style scoped lang="scss">

</style>
