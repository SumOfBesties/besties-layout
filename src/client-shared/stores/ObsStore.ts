import {
    ActiveGameLayout,
    ObsConfig,
    ObsConnectionInfo,
    ObsState,
    ObsVideoInputAssignments,
    ObsVideoInputPositions
} from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';
import { layouts } from 'types/Layouts';

const obsState = nodecg.Replicant<ObsState>('obsState');
const obsConfig = nodecg.Replicant<ObsConfig>('obsConfig');
const obsConnectionInfo = nodecg.Replicant<ObsConnectionInfo>('obsConnectionInfo');
const obsVideoInputAssignments = nodecg.Replicant<ObsVideoInputAssignments>('obsVideoInputAssignments');
const obsVideoInputPositions = nodecg.Replicant<ObsVideoInputPositions>('obsVideoInputPositions');
const activeGameLayout = nodecg.Replicant<ActiveGameLayout>('activeGameLayout');

interface ObsStore {
    obsState: ObsState
    obsConfig: ObsConfig
    obsConnectionInfo: ObsConnectionInfo
    obsVideoInputAssignments: ObsVideoInputAssignments
    obsVideoInputPositions: ObsVideoInputPositions
    activeGameLayout: ActiveGameLayout
}

export const useObsStore = defineStore('obs', {
    state: () => ({
        obsState: null,
        obsConfig: null,
        obsConnectionInfo: null,
        obsVideoInputAssignments: null,
        obsVideoInputPositions: null,
        activeGameLayout: null
    } as unknown as ObsStore),
    actions: {
        setVideoInputPositions(newValue: ObsVideoInputPositions) {
            obsVideoInputPositions.value = newValue;
        },
        setActiveGameLayout(newValue: keyof typeof layouts) {
            activeGameLayout.value = newValue;
        }
    }
});

export const initObsStore = createReplicantStoreInitializer([
    obsState,
    obsConfig,
    obsConnectionInfo,
    obsVideoInputAssignments,
    obsVideoInputPositions,
    activeGameLayout
], useObsStore);
