<template>
    <div class="stream-tech-layout">
        <layout-manager />
        <active-run-manager />
        <next-run-manager />
        <rundown-display class="rundown-display" />
    </div>
    <schedule-item-editor ref="scheduleItemEditor" />
    <country-select-dialog ref="countrySelectDialog" />
</template>

<script setup lang="ts">
import RundownDisplay from '../../components/RundownDisplay.vue';
import ActiveRunManager from './ActiveRunManager.vue';
import ScheduleItemEditor from '../../components/ScheduleItemEditor.vue';
import { provide, ref } from 'vue';
import { CountrySelectDialogInjectionKey, ScheduleItemEditorInjectionKey } from '../../helpers/Injections';
import CountrySelectDialog from '../../components/CountrySelectDialog.vue';
import NextRunManager from './NextRunManager.vue';
import LayoutManager from './LayoutManager.vue';

const scheduleItemEditor = ref<InstanceType<typeof ScheduleItemEditor>>();
provide(ScheduleItemEditorInjectionKey, scheduleItemEditor);
const countrySelectDialog = ref<InstanceType<typeof CountrySelectDialog>>();
provide(CountrySelectDialogInjectionKey, countrySelectDialog);
</script>

<style lang="scss">
body {
    margin: 0;
    overflow-y: hidden;
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
    min-width: 1500px;
    overflow-x: auto;
}
</style>
