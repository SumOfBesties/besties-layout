<template>
    <img
        v-if="flagExists"
        :src="`/bundles/${bundleName}/flags/svg/${props.countryCode}.svg`"
    >
</template>

<script setup lang="ts">
import regions from '../../../flags/regions.json';
import { computed } from 'vue';

const props = defineProps<{
    countryCode: string
}>();

const flagExists = computed(() => Object.keys(regions).includes(props.countryCode));
const bundleName = nodecg.bundleName;
</script>

<style scoped lang="scss">
@use '../styles/colors';

img {
    display: inline-block;
    height: 0.85em;
    border: 2px solid colors.$vfd-light;
}
</style>
