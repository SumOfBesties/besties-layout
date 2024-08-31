import type { AxiosInstance } from 'axios';
import type NodeCG from '@nodecg/types';
import type { Configschema, TwitchData } from 'types/schemas';
import { TwitchOauthClient } from './TwitchOauthClient';
import { createTwitchApiClient } from '../helpers/TwitchApiClientHelper';

interface TwitchCategorySearchResponse {
    data: {
        box_art_url: string
        name: string
        id: string
    }[]
}

interface TwitchGetGameResponse {
    data: {
        id: string
        name: string
        box_art_url: string
        igdb_id: string
    }[]
}

export class TwitchClient {
    private readonly axios: AxiosInstance;
    private readonly twitchData: NodeCG.ServerReplicantWithSchemaDefault<TwitchData>;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>, twitchOauthClient: TwitchOauthClient) {
        this.twitchData = nodecg.Replicant('twitchData') as unknown as NodeCG.ServerReplicantWithSchemaDefault<TwitchData>;
        this.axios = createTwitchApiClient('https://api.twitch.tv/helix', nodecg.bundleConfig, this.twitchData, twitchOauthClient);
    }

    async getGameId(name: string): Promise<string | null> {
        if (!this.isLoggedIn()) return null;
        const response = await this.axios.get<TwitchGetGameResponse>('/games', {
            params: {
                name
            }
        });
        if (response.data.data.length > 0) {
            return response.data.data[0].id;
        } else {
            return null;
        }
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

    async setChannelInfo(title: string, gameId: string): Promise<void> {
        if (!this.isLoggedIn() || this.twitchData.value.loggedInUser == null) return;
        return this.axios.patch('/channels', {
            game_id: gameId,
            title
        }, {
            params: {
                broadcaster_id: this.twitchData.value.loggedInUser.id
            }
        });
    }

    isLoggedIn(): boolean {
        return this.twitchData.value.credentials != null;
    }
}
