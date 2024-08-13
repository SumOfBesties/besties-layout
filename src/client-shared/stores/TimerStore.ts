import { Timer } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const timer = nodecg.Replicant<Timer>('timer');

interface TimerStore {
    timer: Timer
}

export const useTimerStore = defineStore('timer', {
    state: () => ({
        timer: null
    } as unknown as TimerStore),
    getters: {
        timerActive: state => ['RUNNING', 'PAUSED'].includes(state.timer.state)
    }
});

export const initTimerStore = createReplicantStoreInitializer([timer], useTimerStore);
