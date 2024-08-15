import './styles/dashboard-common.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setUpErrorHandler } from './helpers/ErrorHandlerStore';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { initObsStore } from 'client-shared/stores/ObsStore';
import SettingsPanel from './pages/settings/SettingsPanel.vue';

(async () => {
    const app = createApp(SettingsPanel);
    app.use(createPinia());
    setUpErrorHandler(app);
    installCommonHelpers(app, false);
    await initObsStore();
    app.mount('#app');
})();
