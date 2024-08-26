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

        <talent-mixer-channel-assignment-space
            v-for="talentId in scheduleStore.activeSpeedrunTalentIds"
            :speaking-threshold="talentChannels[talentId]?.speakingThresholdDB"
            :talent-id="talentId"
            :assigned-channel="talentChannels[talentId]?.channelId"
            :visible="isOpen"
            class="m-t-8"
            :fallback-talent-name="`Unknown talent ${talentId}`"
            @update:assigned-channel="selectChannel(talentId, $event)"
            @update:speaking-threshold="updateSpeakingThreshold(talentId, $event)"
        />
        <talent-mixer-channel-assignment-space
            :speaking-threshold="hostChannel.speakingThresholdDB"
            :talent-id="talentStore.currentHostId"
            :assigned-channel="hostChannel.channelId"
            class="m-t-8"
            fallback-talent-name="Host (None currently assigned)"
            talent-name-suffix="(Host)"
            :visible="isOpen"
            @update:assigned-channel="hostChannel.channelId = $event"
            @update:speaking-threshold="hostChannel.speakingThresholdDB = $event"
        />

        <ipl-space
            class="m-t-8 layout horizontal"
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
                class="m-l-8"
                @click="isOpen = false"
            />
        </ipl-space>
    </ipl-dialog>
</template>

<script setup lang="ts">
import { IplButton, IplDialog, IplDialogTitle, IplSpace } from '@iplsplatoon/vue-components';
import { ref } from 'vue';
import { useMixerStore } from 'client-shared/stores/MixerStore';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { MixerChannelAssignment } from 'types/schemas';
import TalentMixerChannelAssignmentSpace from './TalentMixerChannelAssignmentSpace.vue';

const mixerStore = useMixerStore();
const scheduleStore = useScheduleStore();
const talentStore = useTalentStore();

const hostChannel = ref<{ channelId?: number, speakingThresholdDB?: number }>({ });
const talentChannels = ref<Record<string, { channelId?: number, speakingThresholdDB?: number }>>({});

function selectChannel(talentId: string, channelId?: number) {
    const existingEntry = talentChannels.value[talentId];
    if (existingEntry == null) {
        talentChannels.value[talentId] = { channelId };
    } else {
        existingEntry.channelId = channelId;
    }
}

function updateSpeakingThreshold(talentId: string, threshold?: number) {
    const existingEntry = talentChannels.value[talentId];
    if (existingEntry == null) {
        talentChannels.value[talentId] = { speakingThresholdDB: threshold };
    } else {
        existingEntry.speakingThresholdDB = threshold;
    }
}

function save() {
    mixerStore.updateTalentChannelAssignments({
        speedrunTalent: Object.entries(talentChannels.value).reduce((result, [talentId, assignment]) => {
            if (assignment.channelId != null) {
                result[talentId] = {
                    channelId: Number(assignment.channelId),
                    speakingThresholdDB: assignment.speakingThresholdDB
                };
            }
            return result;
        }, {} as Record<string, MixerChannelAssignment>),
        host: hostChannel.value.channelId == null ? undefined : (hostChannel.value as { channelId: number, speakingThresholdDB?: number })
    });
}

const isOpen = ref(false);
function open() {
    talentChannels.value = Object.entries(mixerStore.talentMixerChannelAssignments.speedrunTalent).reduce((result, [talentId, assignment]) => {
        result[talentId] = {
            channelId: assignment.channelId,
            speakingThresholdDB: assignment.speakingThresholdDB
        };
        return result;
    }, {} as Record<string, { channelId?: number, speakingThresholdDB?: number }>);
    const existingHostChannel = mixerStore.talentMixerChannelAssignments.host;
    if (existingHostChannel == null) {
        hostChannel.value = { };
    } else {
        hostChannel.value = { ...existingHostChannel };
    }
    isOpen.value = true;
}
defineExpose({
    open
});
</script>
