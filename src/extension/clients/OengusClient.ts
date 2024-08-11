import { type AxiosInstance } from 'axios';
import axios from 'axios';
import { type Configschema, OtherScheduleItem, Schedule, Speedrun, Talent } from 'types/schemas';
import type NodeCG from '@nodecg/types';
import { generateUserAgent } from '../helpers/GenerateUserAgent';

type OengusRunType = 'SINGLE' | 'RACE' | 'COOP' | 'COOP_RACE' | 'OTHER' | 'RELAY' | 'RELAY_RACE';
type OengusSocialPlatform = 'DISCORD' | 'EMAIL' | 'FACEBOOK' | 'INSTAGRAM' | 'NICO' | 'SNAPCHAT' | 'SPEEDRUNCOM' | 'TWITCH' | 'TWITTER' | 'MASTODON' | 'YOUTUBE';

interface OengusV1SocialAccount {
    id: number
    username: string
    platform: OengusSocialPlatform
}

interface OengusV1UserProfile {
    id: number
    emailVerified: boolean
    username: string
    displayName: string
    enabled: boolean
    connections: OengusV1SocialAccount[]
    history: unknown[]
    moderatedMarathons: unknown[]
    volunteeringHistory: unknown[]
    pronouns: string[]
    languagesSpoken: string[]
    banned: boolean
    country: string
    usernameJapanese: string
    twitterName: string
    discordName: string
    twitchName: string
    speedruncomName: string
}

interface OengusV1ScheduleLine {
    id: number
    gameName: string | null
    console: string | null
    emulated: boolean
    ratio: string | null
    categoryName: string | null
    categoryId: number | null
    estimate: string
    setupTime: string
    setupBlock: boolean
    customRun: boolean
    position: number
    type: OengusRunType
    runners: OengusV1UserProfile[]
    setupBlockText: string | null
    customData: string | null
    date: string
    time: string | null
    effectiveSetupTime: string
}

interface OengusV1ScheduleResponse {
    id: number
    lines: OengusV1ScheduleLine[]
}

export class OengusClient {
    private readonly axios: AxiosInstance;
    private readonly logger: NodeCG.Logger;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.logger = new nodecg.Logger('OengusClient');
        this.axios = axios.create({
            baseURL: (nodecg.bundleConfig.oengus?.useSandbox ?? false) ? 'https://sandbox.oengus.io/api' : 'https://oengus.io/api',
            headers: {
                'User-Agent': generateUserAgent(nodecg),
                Accept: 'application/json',
                'oengus-version': '2'
            }
        });
    }

    private generateRunnerIdV1(scheduleLineId: number, runner: OengusV1UserProfile): string {
        return `runner-${scheduleLineId}-${runner.displayName}`;
    }

    // Place every player on the same team for co-op and relay runs
    // For races we can't predict team placements so everybody gets their own team initially
    private getTeamListV1(scheduleLine: OengusV1ScheduleLine): Speedrun['teams'] {
        if (scheduleLine.type === 'RACE' || scheduleLine.type === 'COOP') {
            return [
                {
                    id: '',
                    playerIds: scheduleLine.runners.map(runner => ({
                        externalId: runner.id === -1 ? this.generateRunnerIdV1(scheduleLine.id, runner) : String(runner.id),
                        id: ''
                    }))
                }
            ];
        } else {
            return scheduleLine.runners.map(runner => ({
                id: '',
                playerIds: [{
                    externalId: runner.id === -1 ? this.generateRunnerIdV1(scheduleLine.id, runner) : String(runner.id),
                    id: ''
                }]
            }))
        }
    }

    private findSocialUsernameV1(runner: OengusV1UserProfile, platform: OengusSocialPlatform): string | null {
        return runner.connections.find(connection => connection.platform === platform)?.username ?? null;
    }

    // ['he/him', 'they/them'] -> 'he/they', etc.
    private mergePronouns(pronouns: string[]): string | null {
        if (pronouns.length === 0) return null;
        if (pronouns.length === 1) return pronouns[0];

        const firstPronouns = [];
        for (let i = 0; i < pronouns.length; i++) {
            const splitPronouns = pronouns[i].split('/');
            if (splitPronouns.length !== 2) {
                this.logger.warn(`Couldn't make sense of these pronouns: ${pronouns[i]}`);
                return pronouns.join(', ');
            }
            firstPronouns.push(splitPronouns[0]);
        }
        return firstPronouns.join('/');
    }

    async getScheduleAndTalent(marathonSlug: string): Promise<{ schedule: Schedule, talent: Talent }> {
        const scheduleResponse = await this.axios.get<OengusV1ScheduleResponse>(`/v1/marathons/${marathonSlug}/schedule?withCustomData=true`);

        const scheduleItems: Schedule['items'] = scheduleResponse.data.lines.map(line => {
            if (line.setupBlock) {
                return {
                    id: '',
                    externalId: String(line.id),
                    title: line.setupBlockText || 'Setup Block',
                    type: 'SETUP',
                    estimate: line.estimate,
                    setupTime: line.setupTime,
                    scheduledStartTime: line.date,
                    talentIds: []
                } satisfies OtherScheduleItem;
            } else if (line.type === 'OTHER') {
                return {
                    id: '',
                    externalId: String(line.id),
                    type: 'OTHER',
                    title: line.gameName || `#${line.position} - Untitled Schedule Item`,
                    estimate: line.estimate,
                    setupTime: line.setupTime,
                    scheduledStartTime: line.date,
                    talentIds: line.runners.map(runner => ({
                        id: '',
                        externalId: runner.id === -1 ? this.generateRunnerIdV1(line.id, runner) : String(runner.id)
                    }))
                } satisfies OtherScheduleItem;
            } else {
                return {
                    id: '',
                    externalId: String(line.id),
                    type: 'SPEEDRUN',
                    title: line.gameName || `#${line.position} - Untitled Run`,
                    estimate: line.estimate,
                    setupTime: line.setupTime,
                    scheduledStartTime: line.date,
                    system: line.console,
                    category: line.categoryName,
                    relay: line.type.includes('RELAY'),
                    teams: this.getTeamListV1(line),
                    commentatorIds: []
                } satisfies Speedrun;
            }
        });

        const existingRunnerIdSet = new Set();
        const talent: Talent = [];
        scheduleResponse.data.lines.forEach(line => {
            line.runners.forEach(runner => {
                if (existingRunnerIdSet.has(String(runner.id))) {
                    return;
                }

                const talentItem: Talent[number] = {
                    id: '',
                    externalId: runner.id === -1 ? this.generateRunnerIdV1(line.id, runner) : String(runner.id),
                    name: runner.displayName,
                    pronouns: this.mergePronouns(runner.pronouns),
                    countryCode: runner.country,
                    socials: {
                        twitch: this.findSocialUsernameV1(runner, 'TWITCH'),
                        youtube: this.findSocialUsernameV1(runner, 'YOUTUBE'),
                        twitter: this.findSocialUsernameV1(runner, 'TWITTER'),
                        speedruncom: this.findSocialUsernameV1(runner, 'SPEEDRUNCOM')
                    }
                };

                existingRunnerIdSet.add(talentItem.externalId);
                talent.push(talentItem);
            });
        });

        return {
            schedule: {
                id: marathonSlug,
                source: 'OENGUS',
                items: scheduleItems
            },
            talent
        };
    }
}
