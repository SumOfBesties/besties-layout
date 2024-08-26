<template>
    <ipl-dialog
        v-model:is-open="isOpen"
        style="width: 350px"
    >
        <ipl-dialog-title
            title="Assign mixer channels"
            color="secondary"
            @close="isOpen = false"
        />
        <ipl-space
            class="m-t-8"
            color="secondary"
        >
            <template v-for="talentId in talentIds">
                <ipl-select
                    v-model="talentChannels[talentId]"
                    :label="talentStore.findTalentItemById(talentId)?.name ?? `Unknown talent ${talentId}`"
                    :options="channelOptions"
                    class="talent-channel-select"
                />
                <div
                    v-if="isOpen"
                    class="channel-volume-display"
                    :style="{ transform: `scaleX(${((mixerStore.mixerChannelLevels[talentChannels[talentId]] ?? -90) + 90) / 100})` }"
                />
            </template>
        </ipl-space>
        <ipl-space
            class="m-t-8"
            color="secondary"
        >
            <ipl-select
                v-model="hostChannel"
                :label="talentStore.currentHostId == null ? 'Host (Not currently assigned)' : `${ talentStore.findTalentItemById(talentStore.currentHostId)?.name ?? `Unknown talent ${talentStore.currentHostId}`} (Host)`"
                :options="channelOptions"
            />
        </ipl-space>
        <ipl-space
            class="m-t-8"
            color="secondary"
        >
            <ipl-button
                color="green"
                label="Save"
                @click="save"
            />
            <ipl-button
                color="red"
                label="Close"
                class="m-t-8"
                @click="isOpen = false"
            />
        </ipl-space>
    </ipl-dialog>
</template>

<script setup lang="ts">
import { IplButton, IplDialog, IplDialogTitle, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { computed, ref } from 'vue';
import { useMixerStore } from 'client-shared/stores/MixerStore';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { MixerChannelAssignment } from 'types/schemas';

const mixerStore = useMixerStore();
const scheduleStore = useScheduleStore();
const talentStore = useTalentStore();

// Channel IDs:
// 0-31 = Ch 1-32
// 32-39 = Aux 1-8
// 40-47 = Fx 1L-4R
// 48-63 = Bus 1-16
// 64-69 = Matrix 1-6
// 70 = LR
// 71 = M/C
const channelOptions = computed(() => [
    ...mixerStore.mixerState.channelNames.map((channelName, i) => ({
        value: String(i),
        name: channelName
    })),
    ...mixerStore.mixerState.auxInNames.map((channelName, i) => ({
        value: String(i + 32),
        name: channelName
    })),
    ...mixerStore.mixerState.fxReturnNames.map((channelName, i) => ({
        value: String(i + 40),
        name: channelName
    })),
    ...mixerStore.mixerState.busNames.map((channelName, i) => ({
        value: String(i + 48),
        name: channelName
    })),
    ...mixerStore.mixerState.matrixNames.map((channelName, i) => ({
        value: String(i + 64),
        name: channelName
    })),
    { value: '70', name: mixerStore.mixerState.mainLRName },
    { value: '71', name: mixerStore.mixerState.mainMonoName }
]);

const hostChannel = ref<string | null>(null);
const talentChannels = ref<Record<string, string>>({});
const talentIds = computed(() => {
    const talentIds = new Set<string>();
    if (scheduleStore.activeSpeedrun != null) {
        scheduleStore.activeSpeedrun.teams.forEach(team => {
            team.playerIds.forEach(playerId => {
                talentIds.add(playerId.id);
            });
        });
        scheduleStore.activeSpeedrun.commentatorIds.forEach(commentatorId => {
            talentIds.add(commentatorId.id);
        });
    }
    return Array.from(talentIds.values());
});

function save() {
    mixerStore.updateTalentChannelAssignments({
        speedrunTalent: Object.entries(talentChannels.value).reduce((result, [talentId, channelId]) => {
            result[talentId] = { channelId: Number(channelId) };
            return result;
        }, {} as Record<string, MixerChannelAssignment>),
        host: hostChannel.value == null ? undefined : { channelId: Number(hostChannel.value) }
    });
}

const isOpen = ref(false);
function open() {
    talentChannels.value = Object.entries(mixerStore.talentMixerChannelAssignments.speedrunTalent).reduce((result, [talentId, assignment]) => {
        result[talentId] = String(assignment.channelId);
        return result;
    }, {} as Record<string, string>);
    const hostChannelId = mixerStore.talentMixerChannelAssignments.host?.channelId;
    hostChannel.value = hostChannelId == null ? null : String(hostChannelId);
    isOpen.value = true;
}
defineExpose({
    open
});
</script>

<style scoped lang="scss">
.talent-channel-select:not(:first-child) {
    margin-top: 4px;
}

.channel-volume-display {
    width: 100%;
    height: 8px;
    background-color: #00A651;
    margin-top: 4px;
    transform-origin: left 0;
}
</style>
