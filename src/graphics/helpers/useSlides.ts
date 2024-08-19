import { ComputedRef, MaybeRefOrGetter, onUnmounted, Ref, ref, toValue, watch } from 'vue';
import { getNextIndex } from './ArrayHelper';

interface Slide {
    component: string
    enabled?: ComputedRef<boolean> | undefined
    duration?: number | undefined
    beforeChange?: (component: string) => Promise<void> | void
}

function isSlideEnabled(slide: Slide): boolean {
    return slide.enabled == null || slide.enabled.value;
}

export function useSlides(slideRef: MaybeRefOrGetter<Array<Slide>>): { activeComponent: Ref<string | null>, forceSetSlide: (component: string) => void } {
    const activeIndex = ref<number | null>(null);
    const activeComponent = ref<string | null>(null);

    const setSlide = async (slide: Slide) => {
        if (slide.beforeChange) {
            await slide.beforeChange(slide.component);
        }
        activeComponent.value = slide.component;
    }

    const findNextVisibleSlide = () => {
        const slides = toValue(slideRef);
        // If all slides are disabled, show the first one
        if (slides.length === 0) {
            activeIndex.value = null;
            activeComponent.value = null;
        } else if (slides.every(slide => !isSlideEnabled(slide))) {
            activeIndex.value = 0;
            setSlide(slides[activeIndex.value]);
        } else {
            // On first run, always show the first component if possible
            activeIndex.value = activeIndex.value == null ? 0 : getNextIndex(slides, activeIndex.value);
            let newActiveSlide: Slide = slides[activeIndex.value];
            while (!isSlideEnabled(newActiveSlide)) {
                activeIndex.value = getNextIndex(slides, activeIndex.value);
                newActiveSlide = slides[activeIndex.value];
            }
            setSlide(newActiveSlide);
        }
    };

    let slideChangeTimeout: number | undefined;
    const setSlideChangeTimeout = () => {
        const slides = toValue(slideRef);
        const activeSlide = activeIndex.value == null ? null : slides[activeIndex.value];
        slideChangeTimeout = window.setTimeout(() => {
            findNextVisibleSlide();
            setSlideChangeTimeout();
        }, (activeSlide?.duration ?? 30) * 1000);
    };

    let forceAllowSlide = false;
    const forceSetSlide = (component: string): void => {
        const slides = toValue(slideRef);
        const newSlideIndex = slides.findIndex(slide => slide.component === component);
        if (newSlideIndex === -1) {
            console.error(`Could not find slide ${component}`);
            return;
        }
        const newSlide = slides[newSlideIndex];
        clearTimeout(slideChangeTimeout);
        forceAllowSlide = true;
        activeIndex.value = newSlideIndex;
        setSlide(newSlide);
        setSlideChangeTimeout();
    };

    findNextVisibleSlide();
    setSlideChangeTimeout();

    onUnmounted(() => {
        clearTimeout(slideChangeTimeout);
    });

    watch(() => activeIndex.value == null ? true : toValue(slideRef)[activeIndex.value]?.enabled?.value, newValue => {
        // if a slide is disabled while it is visible, hide it immediately
        if (newValue === false && !forceAllowSlide) {
            clearTimeout(slideChangeTimeout);
            findNextVisibleSlide();
            setSlideChangeTimeout();
        } else {
            forceAllowSlide = false;
        }
    });

    return {
        activeComponent,
        forceSetSlide
    };
}
