import { Talent } from 'types/schemas';
import { defineStore } from 'pinia';
import { createReplicantStoreInitializer } from 'client-shared/helpers/StoreHelper';
import { prettyPrintList } from 'client-shared/helpers/StringHelper';

const talent = nodecg.Replicant<Talent>('talent');

interface TalentStore {
    talent: Talent
}

export const useTalentStore = defineStore('talent', {
    state: () => ({
        talent: null
    } as unknown as TalentStore),
    getters: {
        findTalentItemById: state => (id: string | null | undefined) => id == null ? null : state.talent.find(talentItem => talentItem.id === id),
        formatTalentIdList() {
            return (talentList: { id: string }[]) => {
                return prettyPrintList(talentList.map(talentId => this.findTalentItemById(talentId.id)?.name ?? `Unknown Talent ${talentId.id}`));
            }
        }
    }
});

export const initTalentStore = createReplicantStoreInitializer([talent], useTalentStore);
