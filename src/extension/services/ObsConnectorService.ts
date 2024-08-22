import type NodeCG from '@nodecg/types';
import {
    ObsConfig,
    ObsConnectionInfo,
    ObsState,
    ObsVideoInputAssignments,
    ObsVideoInputPositions
} from 'types/schemas';
import { EventTypes, OBSWebSocketError, OBSWebSocket } from 'obs-websocket-js';
import { isBlank } from '../../client-shared/helpers/StringHelper';

// Authentication failed, Unsupported protocol version, Session invalidated
const SOCKET_CLOSURE_CODES_FORBIDDING_RECONNECTION = [4009, 4010, 4011];
// Checked from OBS's source - Under each source's 'obs_source_info' struct, the output_flags property defines if a
// source outputs video or not. The websocket doesn't expose these details by itself...
const OBS_INPUT_KINDS_WITHOUT_VIDEO = [
    'sck_audio_capture',
    'coreaudio_input_capture',
    'coreaudio_output_capture',
    'oss_input_capture',
    'pulse_input_capture',
    'pulse_output_capture',
    'alsa_input_capture',
    'jack_output_capture',
    'audio_line',
    'sndio_output_capture'
];

type ObsBlendMode =
    | 'OBS_BLEND_NORMAL'
    | 'OBS_BLEND_ADDITIVE'
    | 'OBS_BLEND_SUBTRACT'
    | 'OBS_BLEND_SCREEN'
    | 'OBS_BLEND_MULTIPLY'
    | 'OBS_BLEND_LIGHTEN'
    | 'OBS_BLEND_DARKEN';

type ObsAlignment = 5 | 4 | 6 | 1 | 0 | 2 | 9 | 8 | 10;

type ObsBoundsType =
    | 'OBS_BOUNDS_STRETCH'
    | 'OBS_BOUNDS_SCALE_INNER'
    | 'OBS_BOUNDS_SCALE_OUTER'
    | 'OBS_BOUNDS_SCALE_TO_WIDTH'
    | 'OBS_BOUNDS_SCALE_TO_HEIGHT'
    | 'OBS_BOUNDS_MAX_ONLY'
    | 'OBS_BOUNDS_NONE';

type ObsSceneItemTransform = {
    positionX: number
    positionY: number
    alignment: ObsAlignment
    rotation: number
    scaleX: number
    scaleY: number
    cropTop: number
    cropRight: number
    cropBottom: number
    cropLeft: number
    cropToBounds: boolean
    boundsType: ObsBoundsType
    boundsAlignment: ObsAlignment
    boundsWidth: number
    boundsHeight: number
    sourceWidth: number
    sourceHeight: number
    width: number
    height: number
};

type ObsSceneItem = {
    inputKind: string | null
    isGroup: boolean | null
    sceneItemBlendMode: ObsBlendMode
    sceneItemEnabled: boolean
    sceneItemId: number
    sceneItemIndex: number
    sceneItemLocked: boolean
    sceneItemTransform: ObsSceneItemTransform
    sourceName: string
    sourceType: 'OBS_SOURCE_TYPE_INPUT' | 'OBS_SOURCE_TYPE_SCENE'
};

export class ObsConnectorService {
    private readonly nodecg: NodeCG.ServerAPI;
    private readonly socket: OBSWebSocket;
    private obsConnectionInfo: NodeCG.ServerReplicantWithSchemaDefault<ObsConnectionInfo>;
    private obsConfig: NodeCG.ServerReplicantWithSchemaDefault<ObsConfig>;
    private obsVideoInputAssignments: NodeCG.ServerReplicantWithSchemaDefault<ObsVideoInputAssignments>;
    private obsVideoInputPositions: NodeCG.ServerReplicantWithSchemaDefault<ObsVideoInputPositions>;
    private reconnectionInterval: NodeJS.Timeout | null = null;
    private reconnectionCount: number;
    readonly obsState: NodeCG.ServerReplicantWithSchemaDefault<ObsState>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.obsState = nodecg.Replicant('obsState') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ObsState>;
        this.obsConnectionInfo = nodecg.Replicant('obsConnectionInfo') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ObsConnectionInfo>;
        this.obsConfig = nodecg.Replicant('obsConfig') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ObsConfig>;
        this.obsVideoInputAssignments = nodecg.Replicant('obsVideoInputAssignments') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ObsVideoInputAssignments>;
        this.obsVideoInputPositions = nodecg.Replicant('obsVideoInputPositions') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ObsVideoInputPositions>;
        this.socket = new OBSWebSocket();
        this.reconnectionCount = 0;

        this.obsState.value.status = 'NOT_CONNECTED';

        this.socket
            .on('ConnectionClosed', e => this.handleClosure(e))
            .on('ConnectionOpened', () => this.handleOpening())
            .on('Identified', () => {
                this.handleIdentification().catch(e => {
                    this.nodecg.log.error('Error loading OBS data:', e);
                });
            })
            .on('CurrentProgramSceneChanged', e => this.handleProgramSceneChange(e))
            .on('CurrentSceneCollectionChanged', this.handleSceneCollectionChange.bind(this));

        if (this.obsState.value.enabled) {
            this.connect().catch(e => {
                nodecg.log.error('Error while connecting to OBS:', e.toString());
            });
        }

        this.obsVideoInputPositions.on('change', async () => {
            try {
                await this.setGameLayoutVideoFeedPositions();
            } catch (e) {
                nodecg.log.error('Error updating capture positions:', e);
            }
        });
        this.obsVideoInputAssignments.on('change', async () => {
            try {
                await this.setGameLayoutVideoFeedPositions();
            } catch (e) {
                nodecg.log.error('Error updating capture positions:', e);
            }
        });
    }

    private handleClosure(event: EventTypes['ConnectionClosed']): void {
        if (this.obsState.value.status === 'CONNECTED') {
            if (event.code !== 1000) {
                this.nodecg.log.error(`OBS websocket closed with message: ${event.message}`);
            }
            this.obsState.value.status = 'NOT_CONNECTED';
            if (this.obsState.value.enabled) {
                this.startReconnecting(event.code);
            }
        }

        this.socket
            .off('SceneCreated')
            .off('SceneRemoved')
            .off('SceneNameChanged')
            .off('InputCreated')
            .off('InputRemoved')
            .off('InputNameChanged');
    }

    private async handleIdentification(): Promise<void> {
        const sceneCollections = await this.socket.call('GetSceneCollectionList');
        await this.loadState(sceneCollections.currentSceneCollectionName);
        await this.setGameLayoutVideoFeedPositions();

        this.socket
            .on('SceneCreated', this.handleSceneCreation.bind(this))
            .on('SceneRemoved', this.handleSceneRemoval.bind(this))
            .on('SceneNameChanged', this.handleSceneNameChange.bind(this))
            .on('SceneItemCreated', this.handleSceneItemCreation.bind(this))
            .on('SceneItemRemoved', this.handleSceneItemRemoval.bind(this))
            .on('InputNameChanged', this.handleInputNameChange.bind(this));
    }

    private handleSceneCollectionChange(event: EventTypes['CurrentSceneCollectionChanged']): void {
        this.loadState(event.sceneCollectionName).catch(e => {
            this.nodecg.log.error('Error loading OBS data after scene collection change:', e);
        });
    }

    private async loadState(currentSceneCollection: string): Promise<void> {
        const scenes = await this.getScenes();
        const videoInputs = await this.getVideoInputs();

        this.obsState.value = {
            ...this.obsState.value,
            scenes: scenes.scenes,
            currentScene: scenes.currentScene,
            currentSceneCollection,
            videoInputs
        };
    }

    private handleOpening(): void {
        this.nodecg.log.info('OBS websocket is open.');
        this.obsState.value.status = 'CONNECTED';
        this.stopReconnecting();
    }

    private async handleSceneItemCreation(event: EventTypes['SceneItemCreated']) {
        if (event.sceneName === this.obsConfig.value.videoInputsScene) {
            // This event doesn't give us enough info about the created item, so we just reload the list
            this.obsState.value.videoInputs = await this.getVideoInputs();
        }
    }

    private handleSceneItemRemoval(event: EventTypes['SceneItemRemoved']) {
        if (event.sceneName === this.obsConfig.value.videoInputsScene && this.obsState.value.videoInputs != null) {
            this.obsState.value.videoInputs = this.obsState.value.videoInputs.filter(input => input.sourceName !== event.sourceName);
        }
    }

    private handleInputNameChange(event: EventTypes['InputNameChanged']) {
        if (this.obsState.value.videoInputs != null) {
            this.obsState.value.videoInputs = this.obsState.value.videoInputs.map(input => ({ ...input, sourceName: event.oldInputName === input.sourceName ? event.inputName : input.sourceName }));
        }
        this.obsVideoInputAssignments.value = {
            gameCaptures: this.obsVideoInputAssignments.value.gameCaptures.map(assignment => assignment === event.oldInputName ? event.inputName : assignment),
            cameraCaptures: this.obsVideoInputAssignments.value.cameraCaptures.map(assignment => assignment === event.oldInputName ? event.inputName : assignment)
        };
    }

    private async getVideoInputs(): Promise<ObsState['videoInputs']> {
        const videoInputsScene = this.obsConfig.value.videoInputsScene;
        if (videoInputsScene == null) return [];
        const inputs = await this.socket.call('GetSceneItemList', { sceneName: videoInputsScene });
        return inputs.sceneItems
            .filter(sceneItem => typeof sceneItem.inputKind === 'string' && !OBS_INPUT_KINDS_WITHOUT_VIDEO.includes(sceneItem.inputKind))
            .map(sceneItem => ({
                type: String(sceneItem.inputKind),
                sourceName: String(sceneItem.sourceName),
                sourceUuid: typeof sceneItem.sourceUuid === 'string' ? sceneItem.sourceUuid : null
            }));
    }

    private async setGameLayoutVideoFeedPositions() {
        const gameLayoutVideoFeedsScene = this.obsConfig.value.gameLayoutVideoFeedsScene;
        if (gameLayoutVideoFeedsScene == null || this.obsState.value.status !== 'CONNECTED') return;

        const sceneItemListResponse = await this.socket.call('GetSceneItemList', { sceneName: gameLayoutVideoFeedsScene });
        const unusedSceneItems = sceneItemListResponse.sceneItems as ObsSceneItem[];

        await this.assignCameraCaptures('camera', unusedSceneItems);
        await this.assignCameraCaptures('game', unusedSceneItems);

        this.nodecg.log.debug(`Removing ${unusedSceneItems.length} unused scene items`);
        for (const unusedSceneItem of unusedSceneItems) {
            await this.socket.call('RemoveSceneItem', {
                sceneName: gameLayoutVideoFeedsScene,
                sceneItemId: unusedSceneItem.sceneItemId
            });
        }
    }

    private async assignCameraCaptures(type: 'game' | 'camera', unusedSceneItems: ObsSceneItem[]) {
        const gameLayoutVideoFeedsScene = this.obsConfig.value.gameLayoutVideoFeedsScene;
        if (gameLayoutVideoFeedsScene == null) return;
        const capturePositions = type === 'camera'
            ? this.obsVideoInputPositions.value.cameraCaptures
            : this.obsVideoInputPositions.value.gameCaptures;
        const captureAssignments = type === 'camera'
            ? this.obsVideoInputAssignments.value.cameraCaptures
            : this.obsVideoInputAssignments.value.gameCaptures;
        const boundsType = type === 'camera' ? 'OBS_BOUNDS_SCALE_OUTER' : 'OBS_BOUNDS_STRETCH';

        this.nodecg.log.debug(`Assigning ${capturePositions.length} ${type} capture(s)`);
        for (let i = 0; i < capturePositions.length; i++) {
            const capture = capturePositions[i];
            const assignedFeed = captureAssignments[i] ?? null;
            if (assignedFeed == null || !this.obsState.value.videoInputs?.some(input => input.sourceName === assignedFeed)) {
                this.nodecg.log.debug(`${type} ${i + 1} - Assigned input is missing`);
                continue;
            }

            const exactExistingSceneItemIndex = unusedSceneItems.findIndex(sceneItem =>
                sceneItem.sourceName === assignedFeed
                && sceneItem.sceneItemTransform.positionX === capture.x
                && sceneItem.sceneItemTransform.positionY === capture.y);
            const existingSceneItemIndex = exactExistingSceneItemIndex === -1 ? unusedSceneItems.findIndex(sceneItem => sceneItem.sourceName === assignedFeed) : -1;

            if (existingSceneItemIndex !== -1 || exactExistingSceneItemIndex !== -1) {
                const sceneItemIndex = exactExistingSceneItemIndex === -1 ? existingSceneItemIndex : exactExistingSceneItemIndex;
                const existingSceneItem = unusedSceneItems[sceneItemIndex];
                this.nodecg.log.debug(`${type} ${i + 1} - Found existing scene item`);
                if (
                    existingSceneItem.sceneItemTransform.boundsType !== boundsType
                    || existingSceneItem.sceneItemTransform.boundsHeight !== capture.height
                    || existingSceneItem.sceneItemTransform.boundsWidth !== capture.width
                    || !existingSceneItem.sceneItemTransform.cropToBounds
                    || existingSceneItem.sceneItemTransform.positionX !== capture.x
                    || existingSceneItem.sceneItemTransform.positionY !== capture.y
                ) {
                    this.nodecg.log.debug(`${type} ${i + 1} - Correcting transform settings`);
                    await this.socket.call('SetSceneItemTransform', {
                        sceneName: gameLayoutVideoFeedsScene,
                        sceneItemId: existingSceneItem.sceneItemId,
                        sceneItemTransform: {
                            boundsType,
                            boundsHeight: capture.height,
                            boundsWidth: capture.width,
                            positionX: capture.x,
                            positionY: capture.y,
                            cropToBounds: true
                        }
                    });
                }
                unusedSceneItems.splice(sceneItemIndex, 1);
            } else {
                this.nodecg.log.debug(`${type} ${i + 1} - Creating scene item for assigned input`);
                const newSceneItem = await this.socket.call('CreateSceneItem', {
                    sceneName: gameLayoutVideoFeedsScene,
                    sourceName: assignedFeed,
                    sceneItemEnabled: false
                });
                await this.socket.call('SetSceneItemTransform', {
                    sceneName: gameLayoutVideoFeedsScene,
                    sceneItemId: newSceneItem.sceneItemId,
                    sceneItemTransform: {
                        boundsType,
                        boundsHeight: capture.height,
                        boundsWidth: capture.width,
                        positionX: capture.x,
                        positionY: capture.y,
                        cropToBounds: true
                    }
                });
                await this.socket.call('SetSceneItemEnabled', {
                    sceneName: gameLayoutVideoFeedsScene,
                    sceneItemId: newSceneItem.sceneItemId,
                    sceneItemEnabled: true
                });
            }
        }
    }

    // region Scenes
    private handleSceneCreation(event: EventTypes['SceneCreated']): void {
        if (event.isGroup) return;

        if (this.obsState.value.scenes == null) {
            this.obsState.value.scenes = [event.sceneName];
        } else {
            this.obsState.value.scenes.push(event.sceneName);
        }
    }

    private handleSceneRemoval(event: EventTypes['SceneRemoved']): void {
        if (!event.isGroup && this.obsState.value.scenes != null) {
            this.obsState.value.scenes = this.obsState.value.scenes.filter(scene => scene !== event.sceneName);
        }
    }

    private handleSceneNameChange(event: EventTypes['SceneNameChanged']): void {
        if (this.obsState.value.scenes != null) {
            this.obsState.value.scenes = this.obsState.value.scenes.map(scene =>
                scene === event.oldSceneName ? event.sceneName : scene);
        }

        const configUpdates: Partial<ObsConfig> = {};
        (['videoInputsScene', 'gameLayoutVideoFeedsScene'] as (keyof ObsConfig)[]).forEach(configKey => {
            if (this.obsConfig.value[configKey] === event.oldSceneName) {
                configUpdates[configKey] = event.sceneName;
            }
        });
        if (Object.keys(configUpdates).length > 0) {
            this.obsConfig.value = {
                ...this.obsConfig.value,
                ...configUpdates
            };
        }
    }

    private handleProgramSceneChange(event: EventTypes['CurrentProgramSceneChanged']): void {
        this.obsState.value.currentScene = event.sceneName;
    }

    private async getScenes(): Promise<{ currentScene: string, scenes: string[] }> {
        const sceneList = await this.socket.call('GetSceneList');
        const scenes = sceneList.scenes.map(scene => String(scene.sceneName));

        return {
            currentScene: sceneList.currentProgramSceneName,
            scenes
        };
    }

    setCurrentScene(scene: string): Promise<void> {
        return this.socket.call('SetCurrentProgramScene', { sceneName: scene });
    }
    // endregion

    async connect(reconnectOnFailure = true): Promise<void> {
        await this.socket.disconnect();
        this.obsState.value.status = 'CONNECTING';

        const address = this.obsConnectionInfo.value.address.indexOf('://') === -1
            ? `ws://${this.obsConnectionInfo.value.address}`
            : this.obsConnectionInfo.value.address;
        try {
            await this.socket.connect(
                address,
                isBlank(this.obsConnectionInfo.value.password) ? undefined : this.obsConnectionInfo.value.password);
        } catch (e) {
            this.obsState.value.status = 'NOT_CONNECTED';
            if (reconnectOnFailure) {
                this.startReconnecting(e instanceof OBSWebSocketError ? e.code : undefined);
            }
            throw new Error(`Failed to connect to OBS: ${e instanceof Error ? e.message : String(e)}`);
        }
    }

    async disconnect(): Promise<void> {
        this.stopReconnecting();
        await this.socket.disconnect();
    }

    startReconnecting(socketClosureCode?: number): void {
        if (socketClosureCode != null && SOCKET_CLOSURE_CODES_FORBIDDING_RECONNECTION.includes(socketClosureCode)) return;

        this.stopReconnecting();
        this.reconnectionInterval = setInterval(() => {
            this.reconnectionCount++;
            if (this.reconnectionCount === 1) {
                this.nodecg.log.info('Attempting to reconnect to OBS...');
            }
            this.connect(false).catch(() => {
                // ignore
            });
        }, 10000);
    }

    stopReconnecting(): void {
        if (this.reconnectionInterval) {
            clearInterval(this.reconnectionInterval);
        }
        this.reconnectionInterval = null;
        this.reconnectionCount = 0;
    }

    async setConfig(newValue: ObsConfig): Promise<void> {
        this.obsConfig.value = newValue;
        this.obsState.value.videoInputs = await this.getVideoInputs();
    }
}
