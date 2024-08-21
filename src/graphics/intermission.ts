import './styles/graphics-common.scss';

import { createApp } from 'vue';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { createPinia } from 'pinia';
import { initScheduleStore } from 'client-shared/stores/ScheduleStore';
import { initTalentStore } from 'client-shared/stores/TalentStore';
import { initDonationStore } from 'client-shared/stores/DonationStore';
import { initCurrentTrackerDataStore } from 'client-shared/stores/CurrentTrackerDataStore';
import { initTimerStore } from 'client-shared/stores/TimerStore';
import IntermissionGraphic from './pages/intermission/IntermissionGraphic.vue';
import { initAssetStore } from 'client-shared/stores/AssetStore';
import { initMusicStore } from 'client-shared/stores/MusicStore';

(async () => {
    const app = createApp(IntermissionGraphic);
    installCommonHelpers(app);
    app.use(createPinia());
    await initScheduleStore();
    await initTalentStore();
    await initDonationStore();
    await initCurrentTrackerDataStore();
    await initTimerStore();
    await initAssetStore();
    await initMusicStore();
    app.mount('#app');
})();
