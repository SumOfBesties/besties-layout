import { BaseController } from './BaseController';
import type NodeCG from '@nodecg/types';
import type { ActiveSpeedrun, Configschema, PlayerNameplateAssignments } from 'types/schemas';

export class NameplateAssignmentController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        super(nodecg);

        const activeSpeedrun = nodecg.Replicant('activeSpeedrun') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ActiveSpeedrun>;
        const playerNameplateAssignments = nodecg.Replicant('playerNameplateAssignments') as unknown as NodeCG.ServerReplicantWithSchemaDefault<PlayerNameplateAssignments>;

        this.listen('nameplate:setActiveRelayPlayer', data => {
            if (activeSpeedrun.value == null) {
                throw new Error('No speedrun is active');
            }
            if (!activeSpeedrun.value.relay) {
                throw new Error('Active speedrun is not a relay');
            }

            const team = activeSpeedrun.value.teams.find(team => team.id === data.teamId);
            const nameplateAssignment = playerNameplateAssignments.value.find(assignment => assignment.teamId === data.teamId);
            if (team == null || nameplateAssignment == null) {
                throw new Error('Given team does not exist or has not been assigned a nameplate');
            }
            if (!team.playerIds.some(playerId => playerId.id === data.playerId)) {
                throw new Error('Given player does not exist on given team');
            }
            nameplateAssignment.playerIds = [data.playerId];
        });
    }
}
