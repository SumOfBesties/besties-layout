<template>
    <div class="omnibar-wrapper">
        <img
            src="../../assets/img/small-logo.png"
            class="omnibar-logo"
        >
        <div class="omnibar-main-content">
            <transition name="donation-reminder">
                <div
                    v-if="slides.activeComponent.value?.startsWith('donationReminder')"
                    class="omnibar-donation-reminder"
                >
                    <opacity-swap-transition mode="default">
                        <span v-if="slides.activeComponent.value === 'donationReminder1'">You are watching <span class="emphasis">{{ eventName }}</span></span>
                        <span v-else>In support of the NABP - <span class="emphasis">{{ donationUrl }}</span></span>
                    </opacity-swap-transition>
                </div>
                <div
                    v-else
                    class="bg-inset omnibar-slides"
                >
                    <transition name="slide-swap">
                        <div
                            :key="slideTitle"
                            class="slide-title"
                        >
                            <fitted-content class="slide-title-text">{{ slideTitle }}</fitted-content>
                            <div class="slide-title-icon">»</div>
                        </div>
                    </transition>
                    <div class="slide-content">
                        <transition name="slide-swap">
                            <omnibar-schedule-item-display
                                v-if="slides.activeComponent.value === 'nextUp'"
                                :key="nextScheduleItem?.id"
                                :schedule-item="nextScheduleItem"
                            />
                            <omnibar-schedule-item-display
                                v-else-if="slides.activeComponent.value === 'later'"
                                :key="scheduleItemAfterNext?.id"
                                :schedule-item="scheduleItemAfterNext"
                            />
                            <omnibar-schedule-item-display
                                v-else-if="slides.activeComponent.value === 'nextSpeedrun'"
                                :key="nextSpeedrun?.id"
                                :schedule-item="nextSpeedrun"
                            />
                            <omnibar-milestone-display
                                v-else-if="slides.activeComponent.value === 'milestone'"
                                :key="visibleMilestone?.id"
                                :milestone="visibleMilestone"
                            />
                            <omnibar-incentive-display
                                v-else-if="slides.activeComponent.value === 'incentive'"
                                :key="visibleIncentive?.id"
                                :incentive="visibleIncentive"
                            />
                        </transition>
                    </div>
                </div>
            </transition>
        </div>
        <div class="bg-inset logo-and-total layout horizontal center-vertical">
            <svg
                class="charity-logo"
                viewBox="0 0 90 58"
            >
                <g>
                    <path d="M75.1,6.4c-2.3,2.3-5.1,3-6.7,3.3c-2.4,0.5-4.8,0.5-7.2,0.5c-6.8,0-13.2,0.6-19.1,1.7    C25,15.3,11.8,23,11.8,32.7c0,9.5,12.9,17.6,31.1,20.9c2.6,0.5,5.4,0.9,8.3,1.2c-0.5,1.6-3.5,2.6-4.9,2.8    c-5.4,1.1-14.1-1.4-18.5-2.8c-5.5-1.8-12.2-4.5-18-8.9c-2-1.3-11.8-8.6-9.4-19C3.3,12.8,23.9,5.6,34.3,3.1    c12.5-3,25.6-3.8,38.4-2.7C73.6,0.5,78.1,1,78.1,1S77.1,4.4,75.1,6.4z"/>
                    <path d="M47.2,45.4c-7,0-12.7-5.7-12.7-12.7S40.1,20,47.2,20s12.7,5.7,12.7,12.7S54.2,45.4,47.2,45.4L47.2,45.4    L47.2,45.4z"/>
                </g>
            </svg>
            <donation-total class="m-r-12" />
            <clock />
        </div>
    </div>

</template>

<script setup lang="ts">
import Clock from 'components/Clock.vue';
import DonationTotal from 'components/DonationTotal.vue';
import FittedContent from 'components/FittedContent.vue';
import { useSlides } from '../../helpers/useSlides';
import { computed, ref } from 'vue';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import OmnibarScheduleItemDisplay from './OmnibarScheduleItemDisplay.vue';
import { Configschema, CurrentBids, Milestones } from 'types/schemas';
import OpacitySwapTransition from 'components/OpacitySwapTransition.vue';
import { useCurrentTrackerDataStore } from 'client-shared/stores/CurrentTrackerDataStore';
import { useDonationStore } from 'client-shared/stores/DonationStore';
import { getNextIndex } from '../../helpers/ArrayHelper';
import OmnibarMilestoneDisplay from './OmnibarMilestoneDisplay.vue';
import OmnibarIncentiveDisplay from './OmnibarIncentiveDisplay.vue';

const eventName = (nodecg.bundleConfig as Configschema).event?.name ?? 'the Norway Speedrunner Gathering';
const donationUrl = (nodecg.bundleConfig as Configschema).event?.donationUrl;
const hasDonationUrl = computed(() => donationUrl != null);

const donationStore = useDonationStore();
const scheduleStore = useScheduleStore();
const currentTrackerDataStore = useCurrentTrackerDataStore();

// Grab the next items on the schedule. If the next two items are interstitials, also show the next speedrun.
const interstitialsBeforeActiveRun = computed(() => scheduleStore.interstitialsBeforeActiveRun.filter(interstitial => !interstitial.completed));
const nextScheduleItem = computed(() => {
    if (interstitialsBeforeActiveRun.value.length === 1) {
        return scheduleStore.activeSpeedrun;
    } else if (interstitialsBeforeActiveRun.value.length > 1) {
        return interstitialsBeforeActiveRun.value[1];
    } else {
        return scheduleStore.findScheduleItemAfter(scheduleStore.activeSpeedrun?.id, undefined, false);
    }
});
const scheduleItemAfterNext = computed(() =>
    interstitialsBeforeActiveRun.value.length > 2
        ? interstitialsBeforeActiveRun.value[2]
        : scheduleStore.findScheduleItemAfter(nextScheduleItem.value?.id, undefined, false));
const nextSpeedrun = computed(() => {
    if (
        interstitialsBeforeActiveRun.value.length > 1
        && nextScheduleItem.value?.id !== scheduleStore.activeSpeedrun?.id
        && scheduleItemAfterNext.value?.id !== scheduleStore.activeSpeedrun?.id
    ) return scheduleStore.activeSpeedrun;
    if (
        nextScheduleItem.value?.id === scheduleStore.nextSpeedrun?.id
        || scheduleItemAfterNext.value?.id === scheduleStore.nextSpeedrun?.id
    ) return null;

    return scheduleStore.nextSpeedrun;
});

const visibleMilestone = ref<Milestones[number] | null>(null);
const activeMilestones = computed(() => currentTrackerDataStore.milestones.filter(milestone => donationStore.donationTotal >= milestone.start && donationStore.donationTotal < milestone.amount));
const beforeMilestoneShow = () => {
    if (activeMilestones.value.length === 1 || visibleMilestone.value == null) {
        visibleMilestone.value = activeMilestones.value[0];
    } else {
        const visibleMilestoneIndex = activeMilestones.value.findIndex(milestone => milestone.id === visibleMilestone.value!.id);
        if (visibleMilestoneIndex === -1) {
            visibleMilestone.value = activeMilestones.value[0];
        } else {
            visibleMilestone.value = activeMilestones.value[getNextIndex(activeMilestones.value, visibleMilestoneIndex)];
        }
    }
};

const visibleIncentive = ref<CurrentBids[number] | null>(null);
const activeIncentives = computed(() => currentTrackerDataStore.currentBids.filter(bid => (bid.options == null || bid.options.length === 0) && bid.goal != null));
const beforeIncentiveShow = () => {
    if (activeIncentives.value.length === 1 || visibleIncentive.value == null) {
        visibleIncentive.value = activeIncentives.value[0];
    } else {
        const visibleIncentiveIndex = activeIncentives.value.findIndex(incentive => incentive.id === visibleIncentive.value!.id);
        if (visibleIncentiveIndex === -1) {
            visibleIncentive.value = activeIncentives.value[0];
        } else {
            visibleIncentive.value = activeIncentives.value[getNextIndex(activeIncentives.value, visibleIncentiveIndex)];
        }
    }
};

const slides = useSlides([
    { component: 'nextUp', enabled: computed(() => nextScheduleItem.value != null), duration: 30 },
    { component: 'later', enabled: computed(() => scheduleItemAfterNext.value != null), duration: 30 },
    { component: 'nextSpeedrun', enabled: computed(() => nextSpeedrun.value != null), duration: 30 },
    { component: 'milestone', enabled: computed(() => activeMilestones.value.length > 0), beforeChange: beforeMilestoneShow, duration: 30 },
    { component: 'incentive', enabled: computed(() => activeIncentives.value.length > 0), beforeChange: beforeIncentiveShow, duration: 30 },
    { component: 'donationReminder1', enabled: hasDonationUrl, duration: 10 },
    { component: 'donationReminder2', enabled: hasDonationUrl, duration: 10 }
]);

const slideTitle = computed(() => {
    switch (slides.activeComponent.value) {
        case 'nextUp':
            return 'Up Next';
        case 'later':
        case 'nextSpeedrun':
            return 'Later';
        case 'milestone':
            return 'Milestone';
        case 'incentive':
            return 'Incentive';
        default:
            return '???';
    }
});
</script>

<style lang="scss">
@use '../../styles/constants';

body {
    height: constants.$omnibarHeight;
}
</style>

<style lang="scss" scoped>
@use '../../styles/colors';
@use '../../styles/constants';

.omnibar-wrapper {
    width: 100%;
    height: 100%;
    background: colors.$layout-panel-background;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
}

.omnibar-slides {
    height: 110%;
    width: 100%;
    display: flex;
    align-items: center;
    transform: rotate3d(1, 0, 0, 0deg) translateZ(40px) scale(0.98);
}

.omnibar-main-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1250px;
    height: 100%;
    perspective: 1920px;
    position: relative;
    transform-style: preserve-3d;
}

.slide-title {
    font-weight: 700;
    font-size: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 225px;
    margin: -4px 8px 0;

    .slide-title-text {
        background-color: colors.$vfd-teal;
        color: colors.$vfd-background;
        padding: 2px 12px;
        text-transform: uppercase;
    }

    .slide-title-icon {
        color: colors.$vfd-teal;
        font-size: 40px;
        margin-top: -4px;
        margin-left: 8px;
    }
}

.slide-content {
    flex-grow: 1;
    overflow: hidden;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    margin-top: -4px;
}

.charity-logo {
    height: 45px;
    margin-left: 4px;

    path {
        fill: #FFDF00;
    }
}

.omnibar-logo {
    width: 200px;
    margin-left: 16px;
}

.logo-and-total {
    height: 72px;
    margin-right: 8px;
}

.omnibar-donation-reminder {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom, #93FFFB 0%, #B5FAF7 100%);
    font-size: 40px;
    font-weight: 500;
    text-align: center;
    transform-origin: center;
    transform: rotate3d(1, 0, 0, 0deg) translateZ(40px) scale(0.98);
    opacity: 100%;
    border-color: colors.$layout-gap;
    border-width: 0 2px 0 2px;
    border-style: solid;

    .emphasis {
        color: colors.$vfd-red;
        font-weight: 700;
    }
}

.slide-swap-enter-active {
    transition: transform 350ms ease-in-out;
}
.slide-swap-leave-active {
    position: absolute;
    transition: transform 350ms ease-in-out;
}
.slide-swap-leave-from,
.slide-swap-enter-to {
    transform: translateY(0px);
}
.slide-swap-leave-to {
    transform: translateY(constants.$omnibarHeight * -1);
}
.slide-swap-enter-from {
    transform: translateY(constants.$omnibarHeight);
}

.donation-reminder-leave-active {
    position: absolute;
}
.donation-reminder-enter-active,
.donation-reminder-leave-active {
    transition-duration: 500ms;
    transition-property: transform, opacity;
    transition-timing-function: ease-in-out;
}
.donation-reminder-leave-to {
    transform: rotate3d(1, 0, 0, -90deg) translateZ(40px) scale(0.98);
    opacity: 10%;
}
.donation-reminder-enter-from {
    transform: rotate3d(1, 0, 0, 90deg) translateZ(40px) scale(0.98);
    opacity: 10%;
}
</style>
