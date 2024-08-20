import './styles/dashboard-common.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setUpErrorHandler } from './helpers/ErrorHandlerStore';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { initTwitchDataStore } from 'client-shared/stores/TwitchDataStore';
import TwitchSettingsPanel from './pages/twitch-settings/TwitchSettingsPanel.vue';

(async () => {
    const app = createApp(TwitchSettingsPanel);
    app.use(createPinia());
    setUpErrorHandler(app);
    installCommonHelpers(app, false);
    await initTwitchDataStore();
    app.mount('#app');
})();
