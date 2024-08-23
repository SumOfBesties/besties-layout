import './styles/dashboard-common.scss';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setUpErrorHandler } from './helpers/ErrorHandlerStore';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { initScheduleStore } from 'client-shared/stores/ScheduleStore';
import { initTalentStore } from 'client-shared/stores/TalentStore';
import { initTimerStore } from 'client-shared/stores/TimerStore';
import { initDonationStore } from 'client-shared/stores/DonationStore';
import HostPanel from './pages/host/HostPanel.vue';
import { initObsStore } from 'client-shared/stores/ObsStore';
import { initAllTrackerDataStore } from 'client-shared/stores/AllTrackerDataStore';
import { initCurrentTrackerDataStore } from 'client-shared/stores/CurrentTrackerDataStore';

(async () => {
    const app = createApp(HostPanel);
    app.use(createPinia());
    setUpErrorHandler(app);
    installCommonHelpers(app, false);
    await initScheduleStore();
    await initTalentStore();
    await initTimerStore();
    await initDonationStore();
    await initObsStore();
    await initAllTrackerDataStore();
    await initCurrentTrackerDataStore();
    app.mount('#app');
})();
