<template>
    <canvas
        ref="volumeMeterCanvas"
    />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { colors } from '../../styles/colors';
import { useMixerStore } from 'client-shared/stores/MixerStore';

const mixerStore = useMixerStore();

const props = defineProps<{
    talentId: string
}>();

const volumeMeterCanvas = ref<HTMLCanvasElement>();
onMounted(() => {
    const canvas = volumeMeterCanvas.value;
    if (canvas == null) {
        console.warn('Mounted PlayerVolumeMeter with no canvas?');
        return;
    }
    const ctx = canvas.getContext('2d'),
          width = canvas.clientWidth,
          height = canvas.clientHeight;
    if (ctx == null) {
        console.warn('Received no canvas context');
        return;
    }

    // The canvas looks blurry in OBS if I don't scale it up
    const canvasScale = 2;
    const resizeObserver = new ResizeObserver(entries => {
        if (entries.length !== 1) return;
        canvas.width = entries[0].contentRect.width * canvasScale;
        canvas.height = entries[0].contentRect.height * canvasScale;
        ctx.scale(canvasScale, canvasScale);
    });
    resizeObserver.observe(canvas);
    onUnmounted(() => {
        resizeObserver.disconnect();
    });

    const peakThreshold = 3;
    const smallDotDiameter = 5;
    const smallDotVerticalSpacing = 2;
    const dotDiameter = 10;
    const dotSpacing = 3;
    let lastTime = 0;
    let currentLevel = 0;
    let targetLevel = 0;

    watch(() => {
        const assignment = mixerStore.talentMixerChannelAssignments.speedrunTalent[props.talentId];
        if (assignment == null) return -90;
        return mixerStore.mixerChannelLevels[assignment.channelId] ?? -90;
    }, newValue => {
        targetLevel = (newValue + 90) / 100;
    });

    const redraw = (time: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const deltaTime = time - lastTime;
        lastTime = time;
        if (currentLevel > targetLevel) {
            currentLevel = Math.max(targetLevel, currentLevel - deltaTime / 250);
        } else if (currentLevel < targetLevel) {
            currentLevel = Math.min(targetLevel, currentLevel + deltaTime / 250);
        }

        ctx.fillStyle = colors.vfdTealUnlit;
        const dotCount = Math.floor((width + dotSpacing) / (dotDiameter + dotSpacing));
        const litDotCount = Math.round(dotCount * currentLevel);
        const xOffset = (width - (dotCount * (dotDiameter + dotSpacing) - dotSpacing)) / 2 + dotDiameter / 2;
        for (let i = 0; i < dotCount; i++) {
            const color = i >= dotCount - peakThreshold ? 'peak' : 'normal';
            const drawSmallDot = i >= dotCount - peakThreshold
                ? i === dotCount - peakThreshold
                : i > 12 ? (i - 4) % 8 === 0 : i % 4 === 0;
            if (drawSmallDot) {
                ctx.fillStyle = color === 'peak' ? colors.vfdRed : colors.vfdTeal;
                ctx.beginPath();
                ctx.arc(
                    i * (dotDiameter + dotSpacing) + xOffset,
                    smallDotDiameter / 2,
                    smallDotDiameter / 2,
                    0,
                    Math.PI * 2);
                ctx.fill();
            }

            if (i >= litDotCount) {
                ctx.fillStyle = color === 'peak' ? colors.vfdRedUnlit : colors.vfdTealUnlit;
            } else {
                ctx.fillStyle = color === 'peak' ? colors.vfdRed : colors.vfdTeal;
            }

            ctx.beginPath();
            ctx.arc(
                i * (dotDiameter + dotSpacing) + xOffset,
                smallDotDiameter + smallDotVerticalSpacing + dotDiameter / 2,
                dotDiameter / 2,
                0,
                Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(redraw);
    }

    redraw(0);
});
</script>

<style scoped lang="scss">

</style>
