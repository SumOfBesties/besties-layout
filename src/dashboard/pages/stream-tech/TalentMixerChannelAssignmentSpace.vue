<template>
    <ipl-space color="secondary">
        <div
            class="layout horizontal"
            style="align-items: flex-end"
        >
            <ipl-select
                :model-value="props.assignedChannel == null ? 'none' : String(props.assignedChannel)"
                :label="talentName"
                :option-groups="mixerStore.mixerChannelOptions"
                class="talent-channel-select max-width"
                @update:model-value="selectTalentChannel($event)"
            />
            <div
                class="speaking-indicator"
                :class="{ speaking: visible && (props.speakingThreshold ?? defaultSpeakingThreshold) < (props.assignedChannel == null ? -90 : (mixerStore.mixerChannelLevels[props.assignedChannel] ?? -90)) }"
            >
                SPEAKING
            </div>
        </div>
        <div
            class="m-t-4 layout horizontal"
            style="align-items: flex-end"
        >
            <ipl-input
                :model-value="internalSpeakingThreshold"
                label="Speaking threshold (dB)"
                name="speakingThreshold"
                class="m-r-8 grow"
                @update:model-value="updateSpeakingThreshold($event)"
            />
            <ipl-radio
                v-model="exponent"
                :options="levelExponentOptions"
                label="Channel level exponent"
                name="exponent"
            />
        </div>
        <div
            class="channel-volume-display"
            :style="{ transform: `scaleX(${volumeDisplayScale})` }"
        />
    </ipl-space>
</template>

<script setup lang="ts">
import { IplInput, IplRadio, IplSelect, IplSpace } from '@iplsplatoon/vue-components';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { defaultSpeakingThreshold, useMixerStore } from 'client-shared/stores/MixerStore';
import { computed, ref, watch } from 'vue';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { Option } from '@iplsplatoon/vue-components/dist/types/select';

const talentStore = useTalentStore();
const mixerStore = useMixerStore();
const scheduleStore = useScheduleStore();

const levelExponentOptions: Option[] = [
    { name: '1', value: '1' },
    { name: '1.5', value: '1.5' },
    { name: '2', value: '2' },
    { name: '3', value: '3' }
]

const exponent = computed({
    get() {
        return props.channelLevelExponent == null ? '1' : String(props.channelLevelExponent);
    },
    set(value: string) {
        emit('update:channelLevelExponent', Number(value));
    }
});

const volumeDisplayScale = computed(() => {
    if (props.visible) {
        return ((((props.assignedChannel != null ? mixerStore.mixerChannelLevels[props.assignedChannel] : undefined) ?? -90) + 90) / 100) ** (1 / (props.channelLevelExponent ?? 1));
    }

    return '0';
});

const talentName = computed(() => {
    if (props.teamId != null) {
        const team = scheduleStore.activeSpeedrun?.teams.find(team => team.id === props.teamId);
        if (team == null) {
            return props.fallbackLabel;
        } else {
            return team.name || talentStore.formatTalentIdList(team.playerIds, 4);
        }
    } else {
        const talentItem = talentStore.findTalentItemById(props.talentId);
        if (talentItem == null) {
            return props.fallbackLabel;
        } else {
            return `${talentItem.name} ${props.talentNameSuffix ?? ''}`;
        }
    }
});

const props = defineProps<{
    assignedChannel: number | undefined
    speakingThreshold: number | undefined
    channelLevelExponent: number | undefined
    talentId?: string | null
    teamId?: string
    visible: boolean
    fallbackLabel: string
    talentNameSuffix?: string
}>();

const emit = defineEmits<{
    'update:assignedChannel': [newValue: number | undefined]
    'update:speakingThreshold': [newValue: number | undefined]
    'update:channelLevelExponent': [newValue: number | undefined]
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
@use '../../styles/dashboard-colors';

.channel-volume-display {
    width: 100%;
    height: 8px;
    background-color: dashboard-colors.$state-green;
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
        background-color: dashboard-colors.$state-green;
        color: white;
    }
}
</style>
