<template>
    <div class="other-nameplate-grid">
        <table>
            <tbody>
                <tr
                    v-for="(commentatorRow, i) in commentators"
                    :key="i"
                >
                    <td
                        v-for="(commentator, j) in commentatorRow"
                        :key="commentator?.id ?? j"
                    >
                        <template v-if="commentator != null">
                            <fitted-content
                                class="commentator-name"
                                align="center"
                            >
                                {{ commentator.name }}
                            </fitted-content>
                            <div class="layout horizontal center-horizontal center-vertical m-t-2 m-x-4">
                                <country-flag
                                    v-if="commentator.countryCode != null"
                                    :country-code="commentator.countryCode"
                                    class="commentator-flag"
                                />
                                <fitted-content class="commentator-pronoun-wrapper">
                                    <badge
                                        v-if="!isBlank(commentator.pronouns)"
                                        class="commentator-pronouns"
                                    >
                                        {{ commentator.pronouns }}
                                    </badge>
                                </fitted-content>
                            </div>
                        </template>
                        <div class="cell-index">{{ i * rowCount + j + 1 + nameplatePlayerCount }}</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed } from 'vue';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import chunk from 'lodash/chunk';
import { TalentItem } from 'types/ScheduleHelpers';
import FittedContent from 'components/FittedContent.vue';
import CountryFlag from 'components/CountryFlag.vue';
import { isBlank } from 'client-shared/helpers/StringHelper';
import Badge from 'components/Badge.vue';

const scheduleStore = useScheduleStore();
const talentStore = useTalentStore();

const columnCount = 2;
const rowCount = 2;

const nameplatePlayerCount = computed(() => scheduleStore.playerNameplateAssignments.reduce((result, assignment) => {
    result += assignment.playerIds.length;
    return result;
}, 0));
const commentators = computed(() => {
    const result: (TalentItem | null)[] = scheduleStore.activeSpeedrun?.commentatorIds
        .map(commentatorId => talentStore.findTalentItemById(commentatorId.id))
        .filter(commentator => commentator != null) ?? [];
    if (result.length % columnCount > 0 || result.length === 0) {
        result.push(...Array.from({ length: (result.length === 0) ? columnCount : (result.length % columnCount) }, () => null));
    }
    return chunk(result, columnCount);
});
</script>

<style scoped lang="scss">
@use '../../styles/decorations';
@use '../../styles/colors';

.other-nameplate-grid {
    @include decorations.inset-container;

    padding: 8px;
    color: colors.$vfd-teal;
}

table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    td {
        border: 2px solid colors.$vfd-teal;
        height: 60px;
        text-align: center;
        position: relative;
        padding: 0;
    }
}

.cell-index {
    position: absolute;
    bottom: -2px;
    left: -2px;
    background-color: colors.$vfd-teal;
    font-family: 'Roboto Condensed';
    font-weight: 600;
    font-size: 20px;
    color: colors.$vfd-background;
    min-width: 18px;
    height: 20px;
    line-height: 21px;
    text-align: center;
}

.commentator-name {
    margin: 2px 4px 0;
    font-size: 22px;
    font-weight: 700;
}

.commentator-flag {
    height: 22px;
}

.commentator-flag + .commentator-pronoun-wrapper {
    margin-left: 4px;
}

.commentator-pronouns {
    font-size: 18px;
}
</style>
