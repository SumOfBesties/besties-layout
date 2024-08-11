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
</template>

<script setup lang="ts">
import { IplButton, IplInput, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { ref } from 'vue';
import { useInternalStatusStore } from 'client-shared/stores/InternalStatusStore';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import ErrorDisplay from '../../components/ErrorDisplay.vue';

const internalStatusStore = useInternalStatusStore();

const marathonSlug = ref('');

async function onImport() {
    await sendMessage('schedule:import', { slug: marathonSlug.value });
}
</script>
