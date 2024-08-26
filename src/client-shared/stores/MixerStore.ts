import { MixerChannelLevels, MixerState, TalentMixerChannelAssignments } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const mixerState = nodecg.Replicant<MixerState>('mixerState');
const talentMixerChannelAssignments = nodecg.Replicant<TalentMixerChannelAssignments>('talentMixerChannelAssignments');
const mixerChannelLevels = nodecg.Replicant<MixerChannelLevels>('mixerChannelLevels');

interface MixerStore {
    mixerState: MixerState
    talentMixerChannelAssignments: TalentMixerChannelAssignments
    mixerChannelLevels: MixerChannelLevels
}

export const useMixerStore = defineStore('mixer', {
    state: () => ({
        mixerState: null,
        talentMixerChannelAssignments: null,
        mixerChannelLevels: null
    } as unknown as MixerStore),
    actions: {
        updateTalentChannelAssignments(newValue: TalentMixerChannelAssignments) {
            talentMixerChannelAssignments.value = newValue;
        }
    }
});

export const initMixerStore = createReplicantStoreInitializer([mixerState, talentMixerChannelAssignments, mixerChannelLevels], useMixerStore);
