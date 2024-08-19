<template>
    <div class="host-layout">
        <current-host-manager />
        <div />
        <div />
        <rundown-display />
    </div>
    <country-select-dialog ref="countrySelectDialog" />
    <talent-item-edit-dialog
        ref="talentItemEditDialog"
    />
</template>

<script setup lang="ts">
import RundownDisplay from '../../components/RundownDisplay.vue';
import CurrentHostManager from './CurrentHostManager.vue';
import CountrySelectDialog from '../../components/CountrySelectDialog.vue';
import { provide, ref } from 'vue';
import { CountrySelectDialogInjectionKey, TalentItemEditDialogInjectionKey } from '../../helpers/Injections';
import TalentItemEditDialog from '../../components/TalentItemEditDialog.vue';

const countrySelectDialog = ref<InstanceType<typeof CountrySelectDialog>>();
provide(CountrySelectDialogInjectionKey, countrySelectDialog);
const talentItemEditDialog = ref<InstanceType<typeof TalentItemEditDialog>>();
provide(TalentItemEditDialogInjectionKey, talentItemEditDialog);
</script>

<style lang="scss">
body {
    margin: 0;
    overflow-y: hidden;
}
</style>

<style scoped lang="scss">
.host-layout {
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
