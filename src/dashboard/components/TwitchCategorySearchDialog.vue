<template>
    <ipl-dialog
        v-model:is-open="isOpen"
        style="width: 400px"
    >
        <ipl-message
            v-if="!twitchIntegrationEnabled"
            type="warning"
        >
            Not logged in to Twitch
        </ipl-message>
        <template v-else>
            <ipl-space color="secondary">
                <ipl-input
                    v-model="query"
                    name="categoryName"
                    :loading="searchLoading"
                    theme="large"
                    placeholder="Search for a game or category..."
                    type="search"
                />
            </ipl-space>
            <ipl-space
                color="secondary"
                class="m-t-8 results-display"
            >
                <ipl-space
                    v-for="result in searchResults"
                    :key="result.id"
                    clickable
                    @click="onSelect(result)"
                >
                    <img
                        loading="lazy"
                        :src="result.boxArtUrl"
                    >
                    {{ result.name }}
                </ipl-space>
            </ipl-space>
        </template>
    </ipl-dialog>
</template>

<script setup lang="ts">
import { IplDialog, IplInput, IplMessage, IplSpace } from '@iplsplatoon/vue-components';
import { computed, ref, watch } from 'vue';
import { isBlank } from 'client-shared/helpers/StringHelper';
import { ScheduleItem } from 'types/ScheduleHelpers';
import debounce from 'lodash/debounce';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import { useTwitchDataStore } from 'client-shared/stores/TwitchDataStore';

const twitchDataStore = useTwitchDataStore();

const isOpen = ref(false);
const query = ref('');
let selectCallback: ((category: ScheduleItem['twitchCategory']) => void) | null = null;

const twitchIntegrationEnabled = computed(() => twitchDataStore.twitchData.state !== 'NOT_LOGGED_IN');

const searchResults = ref<{ id: string, name: string, boxArtUrl: string }[]>([]);
const searchLoading = ref(false);
async function onQueryChange(newValue: string) {
    if (isBlank(newValue)) {
        searchResults.value = [];
        searchLoading.value = false;
        return;
    }

    searchLoading.value = true;
    const newSearchResults = await sendMessage('twitch:findCategory', { name: newValue });
    if (newSearchResults == null) {
        searchResults.value = [];
    } else {
        searchResults.value = newSearchResults;
    }
    searchLoading.value = false;
}
const debouncedOnQueryChange = debounce(onQueryChange, 500);
watch(query, debouncedOnQueryChange);

watch(isOpen, newValue => {
    if (!newValue) {
        selectCallback = null;
        query.value = '';
    }
});

function open(onSelect: (category: ScheduleItem['twitchCategory']) => void) {
    selectCallback = onSelect;
    isOpen.value = true;
}

function onSelect(category: { id: string, name: string, boxArtUrl: string }) {
    if (selectCallback) {
        selectCallback({ name: category.name, id: category.id });
    }
    isOpen.value = false;
}

defineExpose({
    open
});
</script>

<style scoped lang="scss">
.results-display {
    height: 75vh;
    overflow-y: auto;

    > * {
        display: grid !important;
        grid-template-columns: 50px 1fr;
        align-items: center;

        img {
            height: 45px;
        }

        &:not(:last-child) {
            margin-bottom: 8px;
        }
    }
}
</style>
