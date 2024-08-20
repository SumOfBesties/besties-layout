import { BaseController } from './BaseController';
import type NodeCG from '@nodecg/types';
import type { Configschema } from 'types/schemas';
import { TwitchService } from '../services/TwitchService';

export class TwitchController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI<Configschema>, twitchService: TwitchService) {
        super(nodecg);

        this.listen('twitch:logout', () => {
            twitchService.logout();
        });
    }
}
