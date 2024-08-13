import type NodeCG from '@nodecg/types';
import type { Configschema, OtherScheduleItem, Schedule, Speedrun, Talent } from 'types/schemas';
import { v4 as uuidV4 } from 'uuid';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';

export class TalentService {
    private readonly logger: NodeCG.Logger;
    private readonly talent: NodeCG.ServerReplicantWithSchemaDefault<Talent>;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.logger = new nodecg.Logger('TalentService');
        this.talent = nodecg.Replicant('talent') as unknown as NodeCG.ServerReplicantWithSchemaDefault<Talent>;
    }

    mergeNewTalentList(talent: Talent): Talent {
        const newTalentList: Talent = [];
        let newTalentCount = 0;
        let updatedTalentCount = 0;

        talent.forEach(newTalentItem => {
            const existingTalentItem = this.talent.value.find(item => item.externalId != null && item.externalId === newTalentItem.externalId);

            if (existingTalentItem == null) {
                newTalentCount++;
                newTalentList.push({
                    ...newTalentItem,
                    id: uuidV4()
                });
            } else {
                updatedTalentCount++;
                newTalentList.push(mergeWith(cloneDeep(existingTalentItem), newTalentItem, (objValue, srcValue, key) => {
                    if (srcValue == null || key === 'id') {
                        return objValue;
                    }
                    return undefined;
                }));
            }
        });

        const existingTalentNotInList: Talent = this.talent.value.filter(existingTalentItem => !newTalentList.some(newTalentItem => newTalentItem.id === existingTalentItem.id));
        const result = newTalentList.concat(existingTalentNotInList);
        this.logger.info(`Merged new talent list (New items: ${newTalentCount}; Updated items: ${updatedTalentCount}; Unmodified items: ${existingTalentNotInList.length}; Total size: ${result.length})`);
        return result;
    }

    getScheduleWithTalentIds(schedule: Schedule['items'], talent: Talent): Schedule['items'] {
        return cloneDeep(schedule).map(scheduleItem => {
            if (scheduleItem.type === 'SPEEDRUN') {
                return {
                    ...scheduleItem,
                    commentatorIds: scheduleItem.commentatorIds.map(item => this.findTalentIdForScheduleTalentItem(item, talent)),
                    teams: scheduleItem.teams.map(team => ({
                        ...team,
                        playerIds: team.playerIds.map(item => this.findTalentIdForScheduleTalentItem(item, talent))
                    }))
                } satisfies Speedrun;
            } else {
                return {
                    ...scheduleItem,
                    talentIds: scheduleItem.talentIds.map(item => this.findTalentIdForScheduleTalentItem(item, talent))
                } satisfies OtherScheduleItem;
            }
        });
    }

    updateTalentItems(talent: Talent) {
        const newTalent = cloneDeep(this.talent.value);
        talent.forEach(talentItem => {
            if (!talentItem.id) {
                throw new Error('All provided talent items must have IDs');
            }
            const existingTalentIndex = this.talent.value.findIndex(existingTalent => existingTalent.id === talentItem.id);
            if (existingTalentIndex === -1) {
                newTalent.push(talentItem);
            } else {
                newTalent[existingTalentIndex] = talentItem;
            }
        });
        this.talent.value = newTalent;
    }

    talentItemExists(talentId: string) {
        return this.talent.value.some(talent => talent.id === talentId);
    }

    private findTalentIdForScheduleTalentItem(ids: { id: string, externalId?: string | null }, talent: Talent): { id: string, externalId?: string | null } {
        if (!!ids.id) {
            return ids;
        }
        if (!ids.externalId) {
            this.logger.error('Found talent in schedule with no IDs (This should never happen!)');
            throw new Error('Found talent in schedule with no IDs');
        }

        const talentItem = talent.find(talentItem => talentItem.externalId != null && talentItem.externalId === ids.externalId);
        if (talentItem == null) {
            this.logger.warn(`Talent in schedule has external ID not present in talent list - Was setTalentIdsInSchedule called before updating the talent list? (Talent ID: ${ids.externalId})`);
            return ids;
        }

        return {
            id: talentItem.id,
            externalId: ids.externalId
        };
    }
}
