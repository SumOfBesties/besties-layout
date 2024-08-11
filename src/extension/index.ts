import type NodeCG from '@nodecg/types';
import { Configschema } from 'types/schemas';
import { ScheduleController } from './controllers/ScheduleController';
import { OengusClient } from './clients/OengusClient';
import { ScheduleService } from './services/ScheduleService';
import { TalentService } from './services/TalentService';
import { ActiveRunService } from './services/ActiveRunService';

export = (nodecg: NodeCG.ServerAPI<Configschema>): void => {
    const oengusClient = new OengusClient(nodecg);

    const talentService = new TalentService(nodecg);
    const scheduleService = new ScheduleService(nodecg, oengusClient, talentService);
    new ActiveRunService(nodecg);

    new ScheduleController(nodecg, scheduleService);
};
