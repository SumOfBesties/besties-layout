<template>
    <div>
        <ipl-input
            v-model="props.modelValue.name"
            name="name"
            label="Name"
        />
        <div class="layout horizontal m-t-4">
            <ipl-input
                v-model="props.modelValue.pronouns"
                name="pronouns"
                label="Pronouns"
                class="max-width"
            />
            <country-code-select
                v-model="props.modelValue.countryCode"
                :color="props.color === 'secondary' ? 'primary' : 'secondary'"
                class="max-width m-l-8"
            />
            <ipl-input
                v-model="props.modelValue.socials.twitch"
                name="twitch"
                label="Twitch"
                class="max-width m-l-8"
            />
        </div>
        <div class="layout horizontal m-t-4">
            <ipl-input
                v-model="props.modelValue.socials.youtube"
                name="youtube"
                label="YouTube"
                class="max-width"
            />
            <ipl-input
                v-model="props.modelValue.socials.twitter"
                name="twitter"
                label="Twitter"
                class="max-width m-l-8"
            />
            <ipl-input
                v-model="props.modelValue.socials.speedruncom"
                name="speedruncom"
                label="Speedrun.com"
                class="max-width m-l-8"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { IplInput } from '@iplsplatoon/vue-components';
import { Talent } from 'types/schemas';
import CountryCodeSelect from './CountryCodeSelect.vue';

const props = defineProps<{
    modelValue: Talent[number]
    color: 'primary' | 'secondary'
}>();
</script>
