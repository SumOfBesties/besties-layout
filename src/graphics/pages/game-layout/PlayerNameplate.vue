<template>
    <div
        class="player-nameplate"
        :data-nameplate-index="props.index"
    >
        <div
            v-for="(talent, i) in talentList"
            class="talent-item"
            :key="talent.id"
        >
            <badge class="talent-index">{{ baseIndex + i + 1 }}</badge>
            <fitted-content align="center">
                {{ talent.name }}
            </fitted-content>
            <badge
                v-if="talent.pronouns"
                class="talent-pronouns"
            >
                {{ talent.pronouns }}
            </badge>
            <country-flag
                v-if="talent.countryCode != null"
                :country-code="talent.countryCode"
                class="talent-country"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed } from 'vue';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { Talent } from 'types/schemas';
import FittedContent from 'components/FittedContent.vue';
import CountryFlag from 'components/CountryFlag.vue';
import Badge from 'components/Badge.vue';

const props = defineProps<{
    index: number
}>();

const scheduleStore = useScheduleStore();
const talentStore = useTalentStore();

const talentList = computed<Talent>(() => {
    const assignments = scheduleStore.playerNameplateAssignments[props.index];
    if (assignments == null) return [];
    return assignments.playerIds.map(playerId => talentStore.findTalentItemById(playerId)).filter(talent => talent != null);
});

const baseIndex = computed(() => scheduleStore.playerNameplateAssignments
    .slice(0, props.index)
    .reduce((result, assignments) => {
        result += assignments.playerIds.length;
        return result;
    }, 0));
</script>

<style scoped lang="scss">
@use '../../styles/colors';

.player-nameplate {
    color: colors.$vfd-teal;
    background-color: colors.$vfd-background;
    text-align: center;
    min-height: 80px;
    font-size: 30px;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
    box-sizing: border-box;
    overflow: hidden;
}

.talent-item {
    margin: 2px 0;
    padding: 0 8px;
    max-width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
}

.talent-country, .talent-pronouns {
    margin-left: 8px;
}

.talent-index {
    margin-right: 4px;
    min-width: 20px;
    line-height: 22px;
    text-align: center;
}
</style>
