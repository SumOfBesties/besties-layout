import type { AxiosInstance } from 'axios';
import type NodeCG from '@nodecg/types';
import type { Configschema, TwitchData } from 'types/schemas';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { TwitchOauthClient } from './TwitchOauthClient';

interface TwitchCategorySearchResponse {
    data: {
        box_art_url: string
        name: string
        id: string
    }[]
}

export class TwitchClient {
    private readonly axios: AxiosInstance;
    private readonly twitchData: NodeCG.ServerReplicantWithSchemaDefault<TwitchData>;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>, twitchOauthClient: TwitchOauthClient) {
        this.twitchData = nodecg.Replicant('twitchData') as unknown as NodeCG.ServerReplicantWithSchemaDefault<TwitchData>;

        this.axios = axios.create({
            baseURL: 'https://api.twitch.tv/helix'
        });
        this.axios.interceptors.request.use((config) => {
            if (nodecg.bundleConfig.twitch?.clientId == null) {
                throw new Error('Twitch client ID is missing');
            }
            if (this.twitchData.value.credentials == null) {
                throw new Error('Not logged in to Twitch');
            }
            config.headers.Authorization = `Bearer ${this.twitchData.value.credentials.accessToken}`;
            config.headers['Client-Id'] = nodecg.bundleConfig.twitch.clientId;
            return config;
        });
        axiosRetry(this.axios, {
            retries: 1,
            retryCondition: error => {
                return error.response?.status === 401 && this.twitchData.value.credentials != null;
            },
            onRetry: async () => {
                await twitchOauthClient.refreshToken();
            }
        });
    }

    async searchForCategory(name: string): Promise<{ id: string, name: string, boxArtUrl: string }[] | undefined> {
        if (!this.isLoggedIn()) return undefined;
        const response = await this.axios.get<TwitchCategorySearchResponse>('/search/categories', {
            params: {
                query: name,
                first: 100
            }
        });

        return response.data.data.map(category => ({ id: category.id, name: category.name, boxArtUrl: category.box_art_url }));
    }

    isLoggedIn(): boolean {
        return this.twitchData.value.credentials != null;
    }
}
