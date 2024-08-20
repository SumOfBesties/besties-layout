import type NodeCG from '@nodecg/types';
import type { Configschema, TwitchData } from 'types/schemas';
import { TwitchOauthClient } from '../clients/TwitchOauthClient';

export class TwitchService {
    private readonly twitchData: NodeCG.ServerReplicantWithSchemaDefault<TwitchData>;

    constructor(
        nodecg: NodeCG.ServerAPI<Configschema>,
        twitchOauthClient: TwitchOauthClient | null
    ) {
        const router = nodecg.Router();
        const logger = new nodecg.Logger(`${nodecg.bundleName}:TwitchService`);
        this.twitchData = nodecg.Replicant('twitchData') as unknown as NodeCG.ServerReplicantWithSchemaDefault<TwitchData>;

        if (twitchOauthClient == null) {
            logger.warn('Twitch API configuration is missing. Logging in to Twitch will not be possible.');
        }

        router.get('/twitch-auth', async (req, res) => {
            if (twitchOauthClient == null) {
                res.status(200).send('<script>window.close();</script>');
                return;
            }
            if (req.query.error) {
                logger.error('Received Twitch callback with error:', req.query.error_description ?? req.query.error);
                res.status(200).send('<script>window.close();</script>');
                return;
            }
            if (req.query.code == null || typeof req.query.code !== 'string') {
                logger.error('Received Twitch callback without code');
                res.status(200).send('<script>window.close();</script>');
                return;
            }

            try {
                await twitchOauthClient.getToken(req.query.code);
            } catch (e) {
                logger.error('Error retrieving access token from Twitch', e);
            } finally {
                res.status(200).send('<script>window.close();</script>');
            }
        });

        nodecg.mount(`/${nodecg.bundleName}`, router);
    }

    logout() {
        this.twitchData.value = {
            syncEnabled: this.twitchData.value.syncEnabled,
            state: 'NOT_LOGGED_IN',
            credentials: undefined,
            loggedInUser: undefined
        };
    }
}
