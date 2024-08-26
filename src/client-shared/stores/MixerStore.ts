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
    },
    getters: {
        mixerChannelOptions(state) {
            // Channel IDs:
            // 0-31 = Ch 1-32
            // 32-39 = Aux 1-8
            // 40-47 = Fx 1L-4R
            // 48-63 = Bus 1-16
            // 64-69 = Matrix 1-6
            return [
                { name: 'None', options: [{ value: 'none', name: 'None' }] },
                {
                    name: 'Input Channels',
                    options: state.mixerState.channelNames.map((channelName, i) => ({
                        value: String(i),
                        name: channelName
                    }))
                },
                {
                    name: 'Aux Returns',
                    options: state.mixerState.auxInNames.map((channelName, i) => ({
                        value: String(i + 32),
                        name: channelName
                    }))
                },
                {
                    name: 'FX Returns',
                    options: state.mixerState.fxReturnNames.map((channelName, i) => ({
                        value: String(i + 40),
                        name: channelName
                    }))
                },
                {
                    name: 'Mix Buses',
                    options: state.mixerState.busNames.map((channelName, i) => ({
                        value: String(i + 48),
                        name: channelName
                    }))
                },
                {
                    name: 'Matrices',
                    options: state.mixerState.matrixNames.map((channelName, i) => ({
                        value: String(i + 64),
                        name: channelName
                    }))
                }
            ];
        }
    }
});

export const initMixerStore = createReplicantStoreInitializer([mixerState, talentMixerChannelAssignments, mixerChannelLevels], useMixerStore);
