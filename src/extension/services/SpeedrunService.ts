import type NodeCG from '@nodecg/types';
import type {
    ActiveSpeedrun,
    Configschema,
    NextSpeedrun,
    Schedule
} from 'types/schemas';
import cloneDeep from 'lodash/cloneDeep';
import { ScheduleService } from './ScheduleService';
import { ScheduleItem } from 'types/ScheduleHelpers';

export class SpeedrunService {
    private readonly schedule: NodeCG.ServerReplicantWithSchemaDefault<Schedule>;
    private readonly activeSpeedrun: NodeCG.ServerReplicantWithSchemaDefault<ActiveSpeedrun>;
    private readonly nextSpeedrun: NodeCG.ServerReplicantWithSchemaDefault<NextSpeedrun>;
    private readonly scheduleService: ScheduleService;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>, scheduleService: ScheduleService) {
        this.schedule = nodecg.Replicant('schedule') as unknown as NodeCG.ServerReplicantWithSchemaDefault<Schedule>;
        this.activeSpeedrun = nodecg.Replicant('activeSpeedrun') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ActiveSpeedrun>;
        this.nextSpeedrun = nodecg.Replicant('nextSpeedrun') as unknown as NodeCG.ServerReplicantWithSchemaDefault<NextSpeedrun>;
        this.scheduleService = scheduleService;

        this.schedule.on('change', newValue => {
            if (newValue.items.length === 0) return;

            if (this.activeSpeedrun.value == null) {
                const firstSpeedrun = newValue.items.find(scheduleItem => scheduleItem.type === 'SPEEDRUN');
                if (firstSpeedrun != null) {
                    this.setActiveSpeedrun(firstSpeedrun);
                }
            }

            const newNextRun = this.scheduleService.findScheduleItemAfter(this.activeSpeedrun.value?.id, 'SPEEDRUN');
            if (newNextRun == null || this.nextSpeedrun.value == null || newNextRun.id !== this.nextSpeedrun.value.id) {
                this.setNextSpeedrun(newNextRun);
            }
        });
    }

    seekToNextRun() {
        if (this.nextSpeedrun.value == null) {
            throw new Error('Cannot determine next run to seek to');
        }

        const newNextRun = this.scheduleService.findScheduleItemAfter(this.nextSpeedrun.value.id, 'SPEEDRUN');
        this.setActiveSpeedrun(this.nextSpeedrun.value);
        this.setNextSpeedrun(newNextRun);
    }

    seekToPreviousRun() {
        const previousRun = this.scheduleService.findScheduleItemBefore(this.activeSpeedrun.value?.id, 'SPEEDRUN');
        if (previousRun == null) {
            throw new Error('Cannot determine previous run to seek to');
        }

        this.setNextSpeedrun(this.activeSpeedrun.value);
        this.setActiveSpeedrun(previousRun);
    }

    setActiveSpeedrunByIndex(scheduleItemIndex: number) {
        const scheduleItem = this.schedule.value.items[scheduleItemIndex];
        if (scheduleItem == null) {
            throw new Error(`No schedule item present at index ${scheduleItemIndex}`);
        }
        this.setActiveSpeedrun(scheduleItem);
    }

    private setActiveSpeedrun(scheduleItem: ScheduleItem) {
        if (scheduleItem.type !== 'SPEEDRUN') {
            throw new Error(`Schedule item is type "${scheduleItem.type}"; Expected "SPEEDRUN"`);
        }
        this.activeSpeedrun.value = cloneDeep(scheduleItem);
    }

    private setNextSpeedrun(scheduleItem: ScheduleItem | null) {
        if (scheduleItem != null && scheduleItem.type !== 'SPEEDRUN') {
            throw new Error(`Schedule item is type "${scheduleItem.type}"; Expected "SPEEDRUN"`);
        }
        this.nextSpeedrun.value = cloneDeep(scheduleItem);
    }
}
