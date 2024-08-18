import { DonationTotal } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';

const donationTotal = nodecg.Replicant<DonationTotal>('donationTotal');

interface DonationStore {
    donationTotal: DonationTotal
}

export const useDonationStore = defineStore('donation', {
    state: () => ({
        donationTotal: 0
    } as unknown as DonationStore)
});

export const initDonationStore = createReplicantStoreInitializer([donationTotal], useDonationStore);
