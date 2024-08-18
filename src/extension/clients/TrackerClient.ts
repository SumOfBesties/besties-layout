import type { AxiosInstance } from 'axios';
import type NodeCG from '@nodecg/types';
import type { Configschema } from 'types/schemas';
import { generateUserAgent } from '../helpers/GenerateUserAgent';
import axios, { isAxiosError } from 'axios';
import cookie from 'cookie';

interface TrackerEventIndexResponse {
    count: {
        runs: number
        prizes: number
        bids: number
        milestones: number
        donors: number
    }
    agg: {
        count: number
        max: number
        avg: number
        median: number
        target: number
        amount: number
    }
}

export class TrackerClient {
    private readonly axios: AxiosInstance;
    private readonly logger: NodeCG.Logger;
    private readonly username?: string;
    private readonly password?: string;
    private readonly address: string;
    private readonly eventId: number;
    private sessionId?: string;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        if (!TrackerClient.hasRequiredTrackerConfig(nodecg)) {
            throw new Error('GDQ tracker config is missing');
        }

        this.username = nodecg.bundleConfig.tracker!.username;
        this.password = nodecg.bundleConfig.tracker!.password;
        this.address = nodecg.bundleConfig.tracker!.address!;
        this.eventId = nodecg.bundleConfig.tracker!.eventId!;
        this.logger = new nodecg.Logger('TrackerClient');
        this.axios = axios.create({
            baseURL: nodecg.bundleConfig.tracker!.address,
            headers: {
                'User-Agent': generateUserAgent(nodecg),
                Accept: 'application/json'
            }
        });
        this.axios.interceptors.request.use(config => {
            if (this.sessionId != null) {
                const sessionCookie = cookie.serialize('sessionid', this.sessionId);
                if (Array.isArray(config.headers.Cookie)) {
                    config.headers.Cookie.push(sessionCookie);
                } else if (config.headers.Cookie == null) {
                    config.headers.Cookie = [sessionCookie];
                }
            }
            return config;
        });
    }

    async getDonationTotal(): Promise<number> {
        const eventIndexResponse = await this.axios.get<TrackerEventIndexResponse>(`/tracker/event/${this.eventId}?json`);
        return eventIndexResponse.data.agg.amount;
    }

    async login() {
        const loginPageResponse = await this.axios.get('/admin/login/');
        const csrfToken = this.findCookie('csrftoken', loginPageResponse.headers['set-cookie']);
        // note: POSTing "/admin/login" (note the trailing slash) does NOT give the user a token
        // on successful login. Incredibly strange behavior!
        try {
            const loginResponse = await this.axios.post('/admin/login/', {
                csrfmiddlewaretoken: csrfToken,
                username: this.username,
                password: this.password,
                next: '/admin/'
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Referer: `${this.address}/admin/login/`,
                    Cookie: csrfToken == null ? null : cookie.serialize('csrftoken', csrfToken)
                },
                maxRedirects: 0,
                validateStatus: status => status === 302
            });
            const sessionId = this.findCookie('sessionid', loginResponse.headers['set-cookie']);
            if (sessionId == null) {
                this.logger.error('Tracker login resulted in redirect, but session cookie was not set. Are the tracker username and password correct?');
            } else {
                this.sessionId = sessionId;
            }
        } catch (e) {
            // "Request failed with status code 200" looks really weird
            if (isAxiosError(e) && e.response?.status === 200) {
                throw new Error('Received status code 200 after logging in; expected 302. Are the tracker username and password correct?');
            }
            throw e;
        }
    }

    private findCookie(cookieName: string, setCookieHeader?: string[]): string | undefined {
        return setCookieHeader
            ?.map(cookieHeader => cookie.parse(cookieHeader))
            .find(parsedHeader => Object.keys(parsedHeader).includes(cookieName))
            ?.[cookieName];
    }

    static hasRequiredTrackerConfig(nodecg: NodeCG.ServerAPI<Configschema>): boolean {
        const trackerConfig = nodecg.bundleConfig.tracker;
        if (trackerConfig == null) return false;
        return [
            trackerConfig.address,
            trackerConfig.eventId
        ].every(configItem => configItem != null);
    }

    static hasTrackerLogin(nodecg: NodeCG.ServerAPI<Configschema>): boolean {
        const trackerConfig = nodecg.bundleConfig.tracker;
        if (trackerConfig == null) return false;
        return [
            trackerConfig.username,
            trackerConfig.password
        ].every(configItem => configItem != null);
    }
}
