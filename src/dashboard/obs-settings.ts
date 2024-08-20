import './styles/dashboard-common.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setUpErrorHandler } from './helpers/ErrorHandlerStore';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { initObsStore } from 'client-shared/stores/ObsStore';
import ObsSettingsPanel from './pages/obs-settings/ObsSettingsPanel.vue';

(async () => {
    const app = createApp(ObsSettingsPanel);
    app.use(createPinia());
    setUpErrorHandler(app);
    installCommonHelpers(app, false);
    await initObsStore();
    app.mount('#app');
})();
