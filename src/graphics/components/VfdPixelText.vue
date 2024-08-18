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
            :style="{ width: `${characterWidth * characterCount}px` }"
        >
            {{ props.textContent }}
        </fitted-content>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import FittedContent from 'components/FittedContent.vue';

const props = withDefaults(defineProps<{
    fontSize: number
    textContent?: string | null
    align?: 'center' | 'left' | 'right'
    textAlign?: 'center' | 'left' | 'right'
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
