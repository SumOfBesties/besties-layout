import type NodeCG from '@nodecg/types';
import type { ActiveSpeedrun, Configschema, Timer } from 'types/schemas';
import * as livesplitCore from 'livesplit-core';
import { Duration } from 'luxon';
import cloneDeep from 'lodash/cloneDeep';

export class TimerService {
    private readonly timerRep: NodeCG.ServerReplicantWithSchemaDefault<Timer>;
    private readonly activeSpeedrun: NodeCG.ServerReplicantWithSchemaDefault<ActiveSpeedrun>;
    private readonly timer: livesplitCore.Timer;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.timerRep = nodecg.Replicant('timer') as unknown as NodeCG.ServerReplicantWithSchemaDefault<Timer>;
        this.activeSpeedrun = nodecg.Replicant('activeSpeedrun') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ActiveSpeedrun>;
        const run = livesplitCore.Run.new();
        run.pushSegment(livesplitCore.Segment.new('done!'));

        this.timer = livesplitCore.Timer.new(run)!;
        this.timer.start();
        this.timer.pause();
        this.initGameTime();
        if (this.timerRep.value.state === 'RUNNING') {
            const missedTime = Date.now() - this.timerRep.value.time.timestamp;
            const previousTime = this.timerRep.value.time.rawTime;
            const timeOffset = previousTime + missedTime;
            nodecg.log.info(`Recovered ${(missedTime / 1000).toFixed(2)} seconds of lost time`);
            this.start(true);
            livesplitCore.TimeSpan.fromSeconds(timeOffset / 1000).with(t => this.timer.setGameTime(t));
        }

        setInterval(this.tick.bind(this), 100);
    }

    start(force = false) {
        if (this.timerRep.value.state === 'FINISHED') {
            throw new Error('Cannot resume finished timer');
        }
        if (!force && !['STOPPED', 'PAUSED'].includes(this.timerRep.value.state)) {
            throw new Error('Timer must be stopped or paused');
        }

        this.timerRep.value.state = 'RUNNING';
        if (this.timer.currentPhase() === 0) {
            this.timer.start();
        } else {
            this.timer.resume();
        }
        this.initGameTime();
    }

    stop(teamId?: string, forfeit?: boolean) {
        if (!['RUNNING', 'PAUSED'].includes(this.timerRep.value.state)) {
            throw new Error('Timer must be running or paused');
        }
        if (teamId == null && this.activeSpeedrun.value != null && this.activeSpeedrun.value.teams.length > 1) {
            throw new Error('Active speedrun has more than one team, but team to stop timer for was not provided');
        }
        if (teamId != null && this.timerRep.value.teamResults[teamId] != null) {
            throw new Error('Team timer is already stopped');
        }

        if (teamId != null) {
            this.timerRep.value.teamResults[teamId] = {
                state: forfeit ? 'FORFEIT' : 'FINISHED',
                time: cloneDeep(this.timerRep.value.time)
            };
        }

        const teamCount = this.activeSpeedrun.value?.teams.length ?? 0;
        const finishedTeamCount = Object.keys(this.timerRep.value.teamResults).length;
        if (teamId == null || finishedTeamCount >= teamCount) {
            if (this.timerRep.value.state === 'PAUSED') {
                this.timer.resume();
            }
            this.timer.split();
            this.timerRep.value.state = 'FINISHED';
        }
    }

    undoStop(teamId?: string) {
        if (!['FINISHED', 'RUNNING'].includes(this.timerRep.value.state)) {
            throw new Error('Timer must be finished or running');
        }
        if (teamId == null && this.activeSpeedrun.value != null && this.activeSpeedrun.value.teams.length > 1) {
            throw new Error('Active speedrun has more than one team, but team to undo stop for was not provided');
        }

        if (teamId != null) {
            delete this.timerRep.value.teamResults[teamId];
        }

        if (this.timerRep.value.state === 'FINISHED') {
            if (this.timer.currentPhase() === 0) {
                this.timer.start();
                livesplitCore.TimeSpan.fromSeconds(this.timerRep.value.time.rawTime / 1000).with(t => this.timer.setGameTime(t));
            } else {
                this.timer.undoSplit();
            }
            this.timerRep.value.state = 'RUNNING';
        }
    }

    pause() {
        if (this.timerRep.value.state !== 'RUNNING') {
            throw new Error('Timer must be running');
        }

        this.timer.pause();
        this.timerRep.value.state = 'PAUSED';
    }

    reset() {
        if (this.timerRep.value.state === 'STOPPED') return;

        this.timer.reset(false);
        this.timerRep.value = {
            state: 'STOPPED',
            time: {
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
                timestamp: 0,
                rawTime: 0
            },
            teamResults: {}
        };
    }

    private tick() {
        if (this.timerRep.value.state !== 'RUNNING') return;

        const gameTime = this.timer.currentTime().gameTime();
        if (gameTime == null) return;
        const millis = gameTime.totalSeconds() * 1000;
        this.timerRep.value.time = {
            ...Duration.fromMillis(millis).shiftTo('hours', 'minutes', 'seconds', 'milliseconds').toObject() as { hours: number, minutes: number, seconds: number, milliseconds: number },
            rawTime: millis,
            timestamp: Date.now()
        };
    }

    private initGameTime() {
        livesplitCore.TimeSpan.fromSeconds(0).with(t => this.timer.setLoadingTimes(t));
        this.timer.initializeGameTime();
        const existingSeconds = this.timerRep.value.time.rawTime / 1000;
        livesplitCore.TimeSpan.fromSeconds(existingSeconds).with(t => this.timer.setGameTime(t));
    }
}
