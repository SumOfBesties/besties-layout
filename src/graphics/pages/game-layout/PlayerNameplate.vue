<template>
    <div
        class="player-nameplate"
        :data-nameplate-index="props.index"
        :style="{
            minHeight: props.fixedHeight ? '80px' : `${Math.max(80, Math.min(props.maxConcurrentPlayers, talentList.length) * 39.5 + 16)}px`
        }"
    >
        <opacity-swap-transition mode="default">
            <div :key="talentListSlides.activeComponent.value ?? '-1'">
                <div
                    v-for="(talent, i) in chunkedTalentList[Number(talentListSlides.activeComponent.value)]"
                    class="talent-item"
                    :key="talent.id"
                >
                    <div class="talent-details-anchor">
                        <div class="talent-details">
                            <badge
                                v-if="disableVolumeMeters"
                                class="talent-index"
                            >
                                {{ baseIndex + i + 1 + Number(talentListSlides.activeComponent.value) * props.maxConcurrentPlayers }}
                            </badge>
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
                    <player-volume-meter
                        v-if="!disableVolumeMeters"
                        :talent-id="talent.id"
                        :index="baseIndex + i + 1 + Number(talentListSlides.activeComponent.value) * props.maxConcurrentPlayers"
                        class="volume-meter"
                    />
                </div>
            </div>
        </opacity-swap-transition>
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
import chunk from 'lodash/chunk';
import { useSlides } from '../../helpers/useSlides';
import OpacitySwapTransition from 'components/OpacitySwapTransition.vue';
import { disableVolumeMeters } from 'client-shared/stores/MixerStore';
import PlayerVolumeMeter from './PlayerVolumeMeter.vue';

const props = withDefaults(defineProps<{
    index: number
    maxConcurrentPlayers?: number
    fixedHeight?: boolean
}>(), {
    maxConcurrentPlayers: 2,
    fixedHeight: false
});

const scheduleStore = useScheduleStore();
const talentStore = useTalentStore();

const talentList = computed<Talent>(() => {
    const assignments = scheduleStore.playerNameplateAssignments[props.index];
    if (assignments == null) return [];
    return assignments.playerIds.map(playerId => talentStore.findTalentItemById(playerId)).filter(talent => talent != null);
});

const chunkedTalentList = computed<Talent[]>(() => chunk(talentList.value, props.maxConcurrentPlayers));
const talentListSlides = useSlides(() => chunkedTalentList.value.map((_, i) => ({ component: String(i), duration: 30 })));

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
    font-size: 30px;
    font-weight: 700;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;

    > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 64px;
        height: 100%;
        width: 100%;
        overflow: hidden;
        padding: 8px 0;
    }
}

.talent-item {
    margin: 2px 0;
    padding: 0 8px;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    display: grid;
    grid-auto-flow: row;
    grid-auto-rows: 1fr;
    height: 60px;

    > .talent-details-anchor {
        position: relative;
    }

    .talent-details {
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        position: absolute;
    }

    > .volume-meter {
        height: 20px;
        max-width: 400px;
        width: 100%;
        margin-top: 2px;
        justify-self: center;
        align-self: center;
    }
}

.talent-country, .talent-pronouns {
    margin-left: 8px;
    font-size: 20px;
}

.talent-country {
    height: 25.5px;
}

.talent-index {
    margin-right: 6px;
    min-width: 20px;
    line-height: 22px;
    text-align: center;
}
</style>
