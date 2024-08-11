import { BaseController } from './BaseController';
import type { Configschema } from 'types/schemas';
import type NodeCG from '@nodecg/types';
import { ScheduleService } from '../services/ScheduleService';

export class ScheduleController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI<Configschema>, scheduleService: ScheduleService) {
        super(nodecg);

        this.listen('schedule:import', async (data) => {
            await scheduleService.importSchedule(data.slug);
        });
    }
}
