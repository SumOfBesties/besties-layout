<template>
    <div>
        <ipl-label>{{ props.label }}</ipl-label>
        <div class="layout horizontal center-horizontal duration-input">
            <ipl-input
                v-model="hours"
                name="hour"
                centered
                type="number"
            />
            <span>:</span>
            <ipl-input
                v-model="minutes"
                name="minute"
                centered
                type="number"
            />
            <span>:</span>
            <ipl-input
                v-model="seconds"
                name="second"
                centered
                type="number"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IplInput, IplLabel } from '@iplsplatoon/vue-components';
import { Duration, DurationObjectUnits } from 'luxon';
import { padNumber } from 'client-shared/helpers/StringHelper';

const props = defineProps<{
    modelValue: string | undefined | null
    label?: string
}>();

const emit = defineEmits<{
    'update:modelValue': [newValue: string | undefined | null]
}>();

const parsedDuration = computed(() => props.modelValue == null ? null : Duration.fromISO(props.modelValue).shiftTo('hours', 'minutes', 'seconds').toObject());

function durationPart(unit: keyof DurationObjectUnits, pad: boolean) {
    return computed({
        get() {
            return pad ? padNumber(parsedDuration.value?.[unit] ?? 0) : (parsedDuration.value?.[unit] ?? 0);
        },
        set(newValue: number | string) {
            emit(
                'update:modelValue',
                Duration.fromObject({ ...(parsedDuration.value ?? {}), [unit]: typeof newValue === 'string' ? 0 : newValue }).toISO());
        }
    })
}

const hours = durationPart('hours', false);
const minutes = durationPart('minutes', true);
const seconds = durationPart('seconds', true);
</script>

<style lang="scss" scoped>
.duration-input span {
    border-bottom: 1px solid var(--ipl-input-color);
    line-height: 1.7em;
}
</style>
