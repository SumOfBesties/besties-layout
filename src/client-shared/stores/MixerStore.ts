import { MixerState, TalentMixerChannelAssignments } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const mixerState = nodecg.Replicant<MixerState>('mixerState');
const talentMixerChannelAssignments = nodecg.Replicant<TalentMixerChannelAssignments>('talentMixerChannelAssignments');

interface MixerStore {
    mixerState: MixerState
    talentMixerChannelAssignments: TalentMixerChannelAssignments
}

export const useMixerStore = defineStore('mixer', {
    state: () => ({
        mixerState: null,
        talentMixerChannelAssignments: null
    } as unknown as MixerStore),
    actions: {
        updateTalentChannelAssignments(newValue: TalentMixerChannelAssignments) {
            talentMixerChannelAssignments.value = newValue;
        }
    }
});

export const initMixerStore = createReplicantStoreInitializer([mixerState, talentMixerChannelAssignments], useMixerStore);
