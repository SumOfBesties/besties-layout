<template>
    <div class="omnibar-schedule-item-display">
        <vfd-pixel-text
            :font-size="24"
            :text-content="props.scheduleItem?.title ?? 'Nothing!'"
            text-align="left"
        />
        <vfd-pixel-text
            :font-size="24"
            :text-content="secondLine"
            text-align="left"
        />
    </div>
</template>

<script setup lang="ts">
import VfdPixelText from 'components/VfdPixelText.vue';
import { ScheduleItem } from 'types/ScheduleHelpers';
import { computed } from 'vue';
import { useTalentStore } from 'client-shared/stores/TalentStore';

const talentStore = useTalentStore();

const props = defineProps<{
    scheduleItem?: ScheduleItem | null
}>();

const secondLine = computed(() => {
    if (props.scheduleItem == null) return '';
    if (props.scheduleItem.type === 'SPEEDRUN') {
        if (!!props.scheduleItem.category) {
            return `${props.scheduleItem.category}·${talentStore.formatSpeedrunTeamList(props.scheduleItem.teams)}`;
        } else {
            return talentStore.formatSpeedrunTeamList(props.scheduleItem.teams);
        }
    } else {
        return talentStore.formatTalentIdList(props.scheduleItem.talentIds, 4);
    }
});
</script>

<style scoped lang="scss">
.omnibar-schedule-item-display {
    width: 100%;
}
</style>
