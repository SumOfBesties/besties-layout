import type NodeCG from '@nodecg/types';
import type { Configschema, MusicState } from 'types/schemas';
import axios from 'axios';
import { Readable } from 'stream';

type FoobarUpdate = { } | {
    player: {
        activeItem: {
            columns: string[]
        }
    }
}

const FOOBAR_RECONNECTION_TIMEOUT = 5000;

export class MusicService {
    private readonly logger: NodeCG.Logger;
    private readonly musicState: NodeCG.ServerReplicantWithSchemaDefault<MusicState>;
    private readonly config: Configschema['foobar2000'];
    private readonly authorization: string | undefined = undefined;
    private reconnectionTimeout: NodeJS.Timeout | null = null;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.logger = new nodecg.Logger(`${nodecg.bundleName}:MusicService`);
        this.musicState = nodecg.Replicant('musicState') as unknown as NodeCG.ServerReplicantWithSchemaDefault<MusicState>;
        this.config = nodecg.bundleConfig.foobar2000;

        if (this.config?.username != null && this.config?.password != null) {
            this.authorization = `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`;
        }

        this.attemptConnection();
    }

    async attemptConnection() {
        this.connect().catch(e => {
            const message = e instanceof Error ? e.message : String(e);
            if (message !== 'canceled') {
                this.logger.error('Error while connecting to foobar2000:', message);
            }
            if (this.reconnectionTimeout) {
                clearTimeout(this.reconnectionTimeout);
            }
            this.reconnectionTimeout = setTimeout(() => {
                this.attemptConnection();
            }, FOOBAR_RECONNECTION_TIMEOUT);
        });
    }

    private async connect() {
        const baseAddress = this.config?.address;
        if (baseAddress == null) {
            this.logger.warn('Foobar2000 address is not configured. Music info will not be available.');
            this.musicState.value = {
                connectionState: 'DISCONNECTED'
            };
            return;
        }
        this.musicState.value.connectionState = 'CONNECTING';
        // Retry if 5s have passed and no connection has been made
        const abortController = new AbortController();
        setTimeout(() => {
            if (this.musicState.value.connectionState === 'CONNECTING') {
                abortController.abort();
                if (this.reconnectionTimeout) {
                    clearTimeout(this.reconnectionTimeout);
                }
                this.reconnectionTimeout = setTimeout(() => {
                    this.attemptConnection();
                }, FOOBAR_RECONNECTION_TIMEOUT);
            }
        }, 5000);
        const response = await axios.get<Readable>(`${baseAddress}/api/query/updates?player=true&trcolumns=%artist%,%title%`, {
            responseType: 'stream',
            signal: abortController.signal,
            headers: {
                Authorization: this.authorization
            }
        });
        this.logger.debug('Connected to foobar2000');
        this.musicState.value.connectionState = 'CONNECTED';
        response.data.on('data', (chunk: Buffer) => {
            try {
                const parsedData = JSON.parse(chunk.toString().slice(6).replace(/(\r\n|\n|\r)/gm, '')) as FoobarUpdate;
                if ('player' in parsedData) {
                    this.musicState.value.track = {
                        artist: parsedData.player.activeItem.columns[0],
                        song: parsedData.player.activeItem.columns[1]
                    }
                }
            } catch (e) {
                this.logger.error('Error parsing foobar2000 response:', e instanceof Error ? e.message : String(e));
                this.logger.debug('Error parsing foobar2000 response:', e);
            }
        });
        response.data.on('close', () => {
            this.logger.warn('Foobar2000 connection closed');
        });
        response.data.on('error', e => {
            this.logger.error('Foobar2000 connection error:', e instanceof Error ? e.message : String(e));
            this.logger.debug('Foobar2000 connection error:', e);
        });
        response.data.on('end', () => {
            this.musicState.value.connectionState = 'DISCONNECTED';
            this.logger.warn('Foobar2000 connection ended');
            if (this.reconnectionTimeout) {
                clearTimeout(this.reconnectionTimeout);
            }
            this.reconnectionTimeout = setTimeout(() => {
                this.attemptConnection();
            }, FOOBAR_RECONNECTION_TIMEOUT);
        });
    }
}
