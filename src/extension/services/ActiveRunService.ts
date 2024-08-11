import type NodeCG from '@nodecg/types';
import type { ActiveSpeedrun, Configschema, OtherScheduleItem, Schedule, Speedrun, Talent } from 'types/schemas';
import cloneDeep from 'lodash/cloneDeep';

export class ActiveRunService {
    private readonly schedule: NodeCG.ServerReplicantWithSchemaDefault<Schedule>;
    private readonly activeSpeedrun: NodeCG.ServerReplicantWithSchemaDefault<ActiveSpeedrun>;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.schedule = nodecg.Replicant('schedule') as unknown as NodeCG.ServerReplicantWithSchemaDefault<Schedule>;
        this.activeSpeedrun = nodecg.Replicant('activeSpeedrun') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ActiveSpeedrun>;

        this.schedule.on('change', newValue => {
            if (this.activeSpeedrun.value != null || newValue.items.length === 0) return;
            const firstSpeedrun = newValue.items.find(scheduleItem => scheduleItem.type === 'SPEEDRUN');
            if (firstSpeedrun == null) return;
            this.setActiveRun(firstSpeedrun);
        });
    }

    setActiveRunByIndex(scheduleItemIndex: number) {
        const scheduleItem = this.schedule.value.items[scheduleItemIndex];
        if (scheduleItem == null) {
            throw new Error(`No schedule item present at index ${scheduleItemIndex}`);
        }
        this.setActiveRun(scheduleItem);
    }

    private setActiveRun(scheduleItem: Speedrun | OtherScheduleItem) {
        if (scheduleItem.type !== 'SPEEDRUN') {
            throw new Error(`Schedule item is type ${scheduleItem.type}; Expected "SPEEDRUN"`);
        }
        this.activeSpeedrun.value = cloneDeep(scheduleItem);
    }
}
