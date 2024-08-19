<template>
    <div
        ref="wrapper"
        class="vfd-pixel-text"
        :style="{
            fontSize: `${props.fontSize}px`,
            height: `${characterHeight}px`,
            justifyContent
        }"
    >
        <span class="background">{{ '▓'.repeat(characterCount) }}</span>
        <fitted-content
            :align="props.textAlign"
            :style="{
                width: `${characterWidth * characterCount}px`,
                whiteSpace: props.progressBar != null ? 'pre' : undefined
            }"
        >
            <template v-if="progressBarInfo != null">
                {{ progressBarInfo.formattedText }}
            </template>
            <template v-else>
                {{ props.textContent }}
            </template>
        </fitted-content>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import FittedContent from 'components/FittedContent.vue';
import { shortenLargeNumber } from 'client-shared/helpers/StringHelper';

const props = withDefaults(defineProps<{
    fontSize: number
    textContent?: string | null
    align?: 'center' | 'left' | 'right'
    textAlign?: 'center' | 'left' | 'right',
    progressBar?: { start: number, end: number, current: number, showStartEnd?: boolean }
}>(), {
    align: 'center',
    textAlign: 'center'
});

const wrapper = ref<HTMLDivElement>();
const wrapperWidth = ref(1);
const wrapperResizeObserver = new ResizeObserver(entries => {
    wrapperWidth.value = entries[0].contentRect.width;
});
onMounted(() => {
    wrapperResizeObserver.observe(wrapper.value!);
});
onUnmounted(() => {
    wrapperResizeObserver.disconnect();
});

const characterHeight = computed(() => Math.round(props.fontSize * 1.1425));
const characterWidth = computed(() => props.fontSize * 0.857);
const characterCount = computed(() => Math.floor(wrapperWidth.value / characterWidth.value));
const justifyContent = computed(() => {
    switch (props.align) {
        case 'center':
            return 'center';
        case 'left':
            return 'flex-start';
        case 'right':
            return 'flex-end';
    }
});

const progressBarInfo = computed(() => {
    if (props.progressBar == null) return null;

    const current = Math.floor(props.progressBar.current);
    const end = Math.floor(props.progressBar.end);
    const start = Math.floor(props.progressBar.start);
    const formattedStart = start === 0 ? '' : shortenLargeNumber(start);
    const formattedEnd = shortenLargeNumber(end);
    const percentage = Math.min(1, (current - start) / (end - start));
    const fullPercentage = current / end;
    const formattedFullPercentage = `${Math.round(fullPercentage * 100)}%`;
    if (props.progressBar.showStartEnd) {
        const progressBarCharacterCount = Math.max(
            6 + formattedStart.length + formattedEnd.length,
            characterCount.value - formattedStart.length - formattedEnd.length);
        const litCharacterCount = Math.max(1, Math.floor(percentage * progressBarCharacterCount));
        const unlitCharacterCount = Math.max(0, progressBarCharacterCount - litCharacterCount);
        const formattedText = `${formattedStart}${'▓'.repeat(litCharacterCount)}${' '.repeat(unlitCharacterCount)}${formattedEnd}`;
        const percentageStartPosition = Math.floor(formattedText.length / 2) - Math.floor(formattedFullPercentage.length / 2);

        // Centers the percentage on the resulting string
        return {
            formattedText: formattedText.substring(0, percentageStartPosition) + formattedFullPercentage + formattedText.substring(percentageStartPosition + formattedFullPercentage.length)
        };
    } else {
        const progressBarCharacterCount = Math.max(6, characterCount.value);
        let litCharacterCount = Math.max(1, Math.floor(percentage * progressBarCharacterCount));
        let unlitCharacterCount = progressBarCharacterCount - litCharacterCount;
        if (unlitCharacterCount <= formattedFullPercentage.length) {
            litCharacterCount -= formattedFullPercentage.length - unlitCharacterCount;
            unlitCharacterCount = 0;
        } else {
            unlitCharacterCount -= formattedFullPercentage.length;
        }

        return {
            formattedText: `${'▓'.repeat(litCharacterCount)}${formattedFullPercentage}${' '.repeat(unlitCharacterCount)}`
        };
    }
});
</script>

<style scoped lang="scss">
@use '../styles/colors';

.vfd-pixel-text {
    font-family: 'HD44780A00 5x8';
    color: colors.$vfd-teal;
    display: flex;
    text-rendering: geometricPrecision;
    position: relative;

    > span {
        position: absolute;
    }
}

.background {
    color: colors.$vfd-teal-unlit;
    position: absolute;
}
</style>
