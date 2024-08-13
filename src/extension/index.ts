import type NodeCG from '@nodecg/types';
import { Configschema } from 'types/schemas';
import { ScheduleController } from './controllers/ScheduleController';
import { OengusClient } from './clients/OengusClient';
import { ScheduleService } from './services/ScheduleService';
import { TalentService } from './services/TalentService';
import { SpeedrunService } from './services/SpeedrunService';
import { SpeedrunController } from './controllers/SpeedrunController';
import { TalentController } from './controllers/TalentController';
import { TimerService } from './services/TimerService';
import { TimerController } from './controllers/TimerController';

export = (nodecg: NodeCG.ServerAPI<Configschema>): void => {
    const oengusClient = new OengusClient(nodecg);

    const timerService = new TimerService(nodecg);
    const talentService = new TalentService(nodecg);
    const scheduleService = new ScheduleService(nodecg, oengusClient, talentService);
    const speedrunService = new SpeedrunService(nodecg, scheduleService);
    scheduleService.init(speedrunService);

    new ScheduleController(nodecg, scheduleService);
    new SpeedrunController(nodecg, speedrunService);
    new TalentController(nodecg, talentService);
    new TimerController(nodecg, timerService);
};
