<template>
    <div class="stream-tech-layout">
        <ipl-space>
            placeholder for something more
        </ipl-space>
        <active-run-manager />
        <ipl-space>
            placeholder for something more
        </ipl-space>
        <rundown-display class="rundown-display" />
    </div>
</template>

<script setup lang="ts">
import RundownDisplay from '../../components/RundownDisplay.vue';
import { IplSpace } from '@iplsplatoon/vue-components';
import ActiveRunManager from './ActiveRunManager.vue';
</script>

<style lang="scss">
body {
    margin: 0;
}
</style>

<style scoped lang="scss">
.stream-tech-layout {
    display: grid;
    height: 100vh;
    padding: 8px;
    grid-template-columns: 0.75fr 1.5fr 1fr 1fr;
    gap: 8px;
    box-sizing: border-box;
}
</style>
