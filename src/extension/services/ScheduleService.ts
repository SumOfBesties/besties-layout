import type NodeCG from '@nodecg/types';
import type { Configschema, Schedule, ScheduleImportStatus, Speedrun, Talent } from 'types/schemas';
import { OengusClient } from '../clients/OengusClient';
import { TalentService } from './TalentService';
import { v4 as uuidV4 } from 'uuid';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';

export class ScheduleService {
    private readonly logger: NodeCG.Logger;
    private readonly scheduleImportStatus: NodeCG.ServerReplicantWithSchemaDefault<ScheduleImportStatus>;
    private readonly schedule: NodeCG.ServerReplicantWithSchemaDefault<Schedule>;
    private readonly talent: NodeCG.ServerReplicantWithSchemaDefault<Talent>;
    private readonly oengusClient: OengusClient;
    private readonly talentService: TalentService;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>, oengusClient: OengusClient, talentService: TalentService) {
        this.logger = new nodecg.Logger('ScheduleService');
        this.scheduleImportStatus = nodecg.Replicant('scheduleImportStatus', { persistent: false }) as unknown as NodeCG.ServerReplicantWithSchemaDefault<ScheduleImportStatus>;
        this.schedule = nodecg.Replicant('schedule') as unknown as NodeCG.ServerReplicantWithSchemaDefault<Schedule>;
        this.talent = nodecg.Replicant('talent') as unknown as NodeCG.ServerReplicantWithSchemaDefault<Talent>;
        this.oengusClient = oengusClient;
        this.talentService = talentService;
    }

    async importSchedule(slug: string): Promise<void> {
        const scheduleAndTalent = await this.oengusClient.getScheduleAndTalent(slug);

        const newTalentList = this.talentService.mergeNewTalentList(scheduleAndTalent.talent);
        const scheduleWithTalentIds = this.talentService.getScheduleWithTalentIds(scheduleAndTalent.schedule.items, newTalentList);
        if (this.schedule.value.id === slug) {
            const mergedSchedule = this.mergeNewScheduleItems(scheduleWithTalentIds);
            this.talent.value = newTalentList;
            this.schedule.value = {
                source: 'OENGUS',
                id: slug,
                items: mergedSchedule
            };
        } else {
            this.talent.value = newTalentList;
            this.schedule.value = {
                source: 'OENGUS',
                id: slug,
                items: this.generateScheduleItemAndTeamIds(scheduleWithTalentIds)
            };
        }
    }

    private generateScheduleItemAndTeamIds(schedule: Schedule['items']): Schedule['items'] {
        return cloneDeep(schedule).map(scheduleItem => {
            if (scheduleItem.type !== 'SPEEDRUN') {
                return {
                    ...scheduleItem,
                    id: uuidV4()
                };
            }

            return {
                ...scheduleItem,
                id: uuidV4(),
                teams: scheduleItem.teams.map(team => ({
                    ...team,
                    id: uuidV4()
                }))
            };
        });
    }

    private mergeNewScheduleItems(schedule: Schedule['items']): Schedule['items'] {
        const newItems: Schedule['items'] = [];
        let newScheduleItemCount = 0;
        let updatedScheduleItemCount = 0;

        schedule.forEach(newScheduleItem => {
            const existingScheduleItem = this.schedule.value.items.find(existing => existing.externalId != null && existing.externalId === newScheduleItem.externalId);

            if (existingScheduleItem == null) {
                newScheduleItemCount++;
                newItems.push({
                    ...newScheduleItem,
                    id: uuidV4()
                });
            } else {
                updatedScheduleItemCount++;
                newItems.push(mergeWith(cloneDeep(existingScheduleItem), newScheduleItem, (objValue, srcValue, key) => {
                    if (srcValue == null || key === 'id') {
                        return objValue;
                    }
                    if (key === 'teams' && objValue != null) {
                        const newTeams = srcValue as Speedrun['teams'];
                        const oldTeams = objValue as Speedrun['teams'];

                        if (oldTeams.length === 1 && newTeams.length === 1) {
                            const oldTeam = oldTeams[0];
                            return [
                                {
                                    id: oldTeam.id,
                                    name: oldTeam.name,
                                    playerIds: newTeams[0].playerIds
                                }
                            ] satisfies Speedrun['teams'];
                        }

                        // todo: this will remove any players that weren't on the schedule but were instead added by us through NodeCG
                        const result: Speedrun['teams'] = [];
                        newTeams.forEach(newTeam => {
                            const matchingOldTeamsForPlayers = newTeam.playerIds
                                .map(newTeamPlayer => oldTeams.find(oldTeam => oldTeam.playerIds.some(oldTeamPlayer => newTeamPlayer.id === oldTeamPlayer.id)))
                                .filter(Boolean) as Speedrun['teams'];

                            if (matchingOldTeamsForPlayers.length === 1 || new Set(matchingOldTeamsForPlayers.map(team => team.id)).size === 1) {
                                // All of these players either weren't previously on a team or played for the same team
                                const matchingOldTeam = matchingOldTeamsForPlayers[0];
                                const existingNewTeam = result.find(resultTeam => resultTeam.id === matchingOldTeam.id);
                                if (existingNewTeam != null) {
                                    existingNewTeam.playerIds.push(...newTeam.playerIds);
                                } else {
                                    result.push({
                                        ...matchingOldTeam,
                                        name: newTeam.name || matchingOldTeam.name,
                                        playerIds: newTeam.playerIds
                                    });
                                }
                            } else {
                                // All these players weren't previously on a team or played on different teams
                                result.push({
                                    ...newTeam,
                                    id: uuidV4()
                                });
                            }
                        });
                        return result;
                    }
                    if (key === 'commentatorIds') {
                        // todo: atm no schedule importer knows commentator IDs, but this needs improved if that becomes possible
                        return objValue;
                    }
                    // The default method of merging arrays creates bad results
                    if (Array.isArray(srcValue) && Array.isArray(objValue)) {
                        return srcValue;
                    }
                    return undefined;
                }));
            }
        });

        this.logger.info(`Merged new schedule (New items: ${newScheduleItemCount}; Updated items: ${updatedScheduleItemCount}; Total items: ${newItems.length})`);
        return newItems;
    }
}
