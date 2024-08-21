<template>
    <error-display class="m-b-8" />
    <ipl-space>
        <ipl-message
            v-if="internalStatusStore.scheduleImportStatus.inProgress"
            type="info"
            class="m-b-8"
        >
            Schedule import in progress ({{ internalStatusStore.scheduleImportStatus.currentItem ?? '?' }}/{{ internalStatusStore.scheduleImportStatus.totalItems ?? '?' }})
        </ipl-message>
        <ipl-input
            v-model="marathonSlug"
            name="marathon-slug"
            label="Marathon slug"
        />
        <ipl-button
            label="Import"
            async
            :disabled="internalStatusStore.scheduleImportStatus.inProgress"
            class="m-t-8"
            @click="onImport"
        />
    </ipl-space>
    <ipl-space class="m-t-8">
        <div class="title">Loaded data</div>
        <ipl-data-row
            label="Source"
            :value="scheduleStore.schedule.source"
        />
        <ipl-data-row
            label="ID"
            :value="scheduleStore.schedule.id"
            copiable
        />
        <template v-if="scheduleStore.schedule.sourceSpecificData?.oengus">
            <ipl-data-row
                label="Schedule Slug"
                :value="scheduleStore.schedule.sourceSpecificData.oengus.scheduleSlug"
            />
            <ipl-data-row
                label="Schedule ID"
                :value="scheduleStore.schedule.sourceSpecificData.oengus.scheduleId"
            />
        </template>
    </ipl-space>
</template>

<script setup lang="ts">
import { IplButton, IplDataRow, IplInput, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { ref } from 'vue';
import { useInternalStatusStore } from 'client-shared/stores/InternalStatusStore';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import ErrorDisplay from '../../components/ErrorDisplay.vue';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';

const scheduleStore = useScheduleStore();
const internalStatusStore = useInternalStatusStore();

const marathonSlug = ref('');

async function onImport() {
    await sendMessage('schedule:import', { slug: marathonSlug.value });
}
</script>
