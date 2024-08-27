<template>
    <ipl-space color="secondary">
        <ipl-select
            :model-value="props.assignedChannel == null ? 'none' : String(props.assignedChannel)"
            :label="talentName"
            :option-groups="mixerStore.mixerChannelOptions"
            class="talent-channel-select"
            @update:model-value="selectTalentChannel($event)"
        />
        <div
            class="m-t-4 layout horizontal"
            style="align-items: flex-end"
        >
            <ipl-input
                :model-value="internalSpeakingThreshold"
                label="Speaking threshold (dB)"
                name="speakingThreshold"
                class="max-width"
                @update:model-value="updateSpeakingThreshold($event)"
            />
            <div
                class="speaking-indicator"
                :class="{ speaking: visible && (props.speakingThreshold ?? defaultSpeakingThreshold) < (props.assignedChannel == null ? -90 : (mixerStore.mixerChannelLevels[props.assignedChannel] ?? -90)) }"
            >
                SPEAKING
            </div>
        </div>
        <div
            v-if="visible"
            class="channel-volume-display"
            :style="{ transform: `scaleX(${(((props.assignedChannel != null ? mixerStore.mixerChannelLevels[props.assignedChannel] : undefined) ?? -90) + 90) / 100})` }"
        />
        <div
            v-else
            class="channel-volume-display"
            style="transform: scaleX(0)"
        />
    </ipl-space>
</template>

<script setup lang="ts">
import { IplInput, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { defaultSpeakingThreshold, useMixerStore } from 'client-shared/stores/MixerStore';
import { computed, ref, watch } from 'vue';

const talentStore = useTalentStore();
const mixerStore = useMixerStore();

const talentName = computed(() => {
    const talentItem = talentStore.findTalentItemById(props.talentId);
    if (talentItem == null) {
        return props.fallbackTalentName;
    } else {
        return `${talentItem.name} ${props.talentNameSuffix ?? ''}`;
    }
});

const props = defineProps<{
    assignedChannel: number | undefined
    speakingThreshold: number | undefined
    talentId: string | null
    visible: boolean
    fallbackTalentName: string
    talentNameSuffix?: string
}>();

const emit = defineEmits<{
    'update:assignedChannel': [newValue: number | undefined]
    'update:speakingThreshold': [newValue: number | undefined]
}>();

function selectTalentChannel(channelId: string) {
    emit('update:assignedChannel', channelId === 'none' ? undefined : Number(channelId));
}

const internalSpeakingThreshold = ref<string>(String(defaultSpeakingThreshold));
watch(() => props.speakingThreshold, newValue => {
    if (newValue != null) {
        internalSpeakingThreshold.value = String(newValue);
    }
}, { immediate: true });
watch(() => props.visible, newValue => {
    if (newValue) {
        internalSpeakingThreshold.value = String(props.speakingThreshold ?? defaultSpeakingThreshold);
    }
});
function updateSpeakingThreshold(threshold: string) {
    internalSpeakingThreshold.value = threshold;
    const parsedThreshold = parseInt(threshold);
    emit('update:speakingThreshold', !isNaN(parsedThreshold) ? parsedThreshold : undefined);
}
</script>

<style scoped lang="scss">
.channel-volume-display {
    width: 100%;
    height: 8px;
    background-color: #00A651;
    margin-top: 4px;
    transform-origin: left 0;
    transition: transform 100ms;
}

.speaking-indicator {
    min-height: 25px;
    border-radius: 8px;
    margin-left: 8px;
    background-color: rgba(34, 34, 34, 0.5);
    color: var(--ipl-bg-secondary);
    font-weight: 700;
    padding: 0 8px;
    line-height: 1.55em;
    transition-property: background-color, color;
    transition-duration: 150ms;

    &.speaking {
        background-color: #00A651;
        color: white;
    }
}
</style>
