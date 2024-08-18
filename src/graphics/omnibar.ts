import './styles/graphics-common.scss';

import { createApp } from 'vue';
import OmnibarGraphic from './pages/omnibar/OmnibarGraphic.vue';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { createPinia } from 'pinia';
import { initScheduleStore } from 'client-shared/stores/ScheduleStore';
import { initTalentStore } from 'client-shared/stores/TalentStore';
import { initDonationStore } from 'client-shared/stores/DonationStore';

(async () => {
    const app = createApp(OmnibarGraphic);
    installCommonHelpers(app);
    app.use(createPinia());
    await initScheduleStore();
    await initTalentStore();
    await initDonationStore();
    app.mount('#app');
})();
