import type NodeCG from '@nodecg/types';
import type { Configschema, DonationTotal } from 'types/schemas';
import { TrackerClient } from '../clients/TrackerClient';

export class TrackerService {
    private readonly nodecg: NodeCG.ServerAPI<Configschema>;
    private readonly logger: NodeCG.Logger;
    private readonly trackerClient?: TrackerClient;
    private readonly donationTotal: NodeCG.ServerReplicantWithSchemaDefault<DonationTotal>;
    private donationTotalApiUpdateTimeout: NodeJS.Timeout | undefined = undefined;
    private isFirstLogin = true;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.logger = new nodecg.Logger(`${nodecg.bundleName}:TrackerService`);
        this.donationTotal = nodecg.Replicant('donationTotal') as unknown as NodeCG.ServerReplicantWithSchemaDefault<DonationTotal>;
        this.nodecg = nodecg;

        if (!TrackerClient.hasRequiredTrackerConfig(nodecg)) {
            this.logger.warn('Some GDQ tracker configuration is missing!');
        } else {
            this.trackerClient = new TrackerClient(nodecg);

            if (TrackerClient.hasTrackerLogin(nodecg)) {
                this.doLoginLoop();
            } else {
                this.logger.warn('GDQ tracker login info is not configured. Some privileged data will not be retrieved from the tracker.');
            }

            this.updateDonationTotal(true);
        }
    }

    private async doLoginLoop() {
        await this.trackerClient?.login()
            .then(() => {
                if (this.isFirstLogin) {
                    this.isFirstLogin = false;
                    this.logger.info('Successfully logged in to GDQ tracker');
                } else {
                    this.logger.debug('Successfully logged in to GDQ tracker');
                }
                setTimeout(this.doLoginLoop.bind(this), 90 * 60 * 1000);
            })
            .catch(e => {
                this.logger.error('Failed to log in to GDQ tracker:', e instanceof Error ? e.message : String(e));
                this.logger.debug('Failed to log in to GDQ tracker:', e);
                if (!this.isFirstLogin) {
                    setTimeout(this.doLoginLoop.bind(this), 60 * 1000);
                }
            });
    }

    private async updateDonationTotal(force = false) {
        try {
            if (this.trackerClient == null) return;
            const newTotal = await this.trackerClient.getDonationTotal();
            if (force || this.donationTotal.value < newTotal) {
                this.donationTotal.value = newTotal;
            }
        } catch (e) {
            this.logger.error('Error updating donation total:', e instanceof Error ? e.message : String(e));
            this.logger.debug('Error updating donation total:', e);
        } finally {
            // todo: reset this timeout when the socket updates the total
            this.donationTotalApiUpdateTimeout = setTimeout(this.updateDonationTotal.bind(this), 60 * 1000);
        }
    }
}
