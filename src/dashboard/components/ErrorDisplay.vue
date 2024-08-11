<template>
    <div
        v-if="Object.keys(recentErrors).length > 0"
        class="layout vertical center-horizontal"
    >
        <ipl-message
            v-for="(err, key, index) in recentErrors"
            :key="key"
            type="error"
            closeable
            class="error-message"
            :class="{'m-t-8': index > 0}"
            :data-test="`recent-error-${key}`"
            @close="removeMessage(key)"
        >
            <div class="max-width">
                {{ formatMessage(err) }}
            </div>
        </ipl-message>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { IplMessage } from '@iplsplatoon/vue-components';
import { useErrorHandlerStore } from '../helpers/ErrorHandlerStore';
import { addDots } from 'client-shared/helpers/StringHelper';

export default defineComponent({
    components: { IplMessage },

    setup() {
        const store = useErrorHandlerStore();

        if (!store) throw new Error('Missing error handler store.');

        return {
            recentErrors: computed(() => store.recentErrors),
            removeMessage(key: string) {
                store.removeRecentError({ key });
            },
            formatMessage(err: unknown): string {
                let result: string;
                if (typeof err === 'object' && err != null && 'message' in err) {
                    result = String(err.message);
                } else {
                    result = String(err);
                }
                return addDots(result, 256);
            },
            addDots
        };
    }
});
</script>

<style lang="scss">
.error-message {
    min-width: 236px;
    max-width: 272px;
}
</style>
