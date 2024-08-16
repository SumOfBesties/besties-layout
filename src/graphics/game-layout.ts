import './styles/graphics-common.scss';

import { createApp } from 'vue';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { createPinia } from 'pinia';
import GameLayoutGraphic from './pages/game-layout/GameLayoutGraphic.vue';
import { initObsStore } from 'client-shared/stores/ObsStore';
import { initScheduleStore } from 'client-shared/stores/ScheduleStore';
import { initTalentStore } from 'client-shared/stores/TalentStore';
import { initTimerStore } from 'client-shared/stores/TimerStore';
import { initAssetStore } from 'client-shared/stores/AssetStore';

(async () => {
    const app = createApp(GameLayoutGraphic);
    installCommonHelpers(app);
    app.use(createPinia());
    await initObsStore();
    await initScheduleStore();
    await initTalentStore();
    await initTimerStore();
    await initAssetStore();
    app.mount('#app');
})();
