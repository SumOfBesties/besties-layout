import { BaseController } from './BaseController';
import type NodeCG from '@nodecg/types';
import type { Configschema } from 'types/schemas';
import { TalentService } from '../services/TalentService';

export class TalentController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI<Configschema>, talentService: TalentService) {
        super(nodecg);

        this.listen('talent:updateTalentItems', data => {
            talentService.updateTalentItems(data);
        });
    }
}
