import { InjectionKey, Ref } from 'vue';
import ScheduleItemEditor from '../components/ScheduleItemEditor.vue';

export const ScheduleItemEditorInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof ScheduleItemEditor> | undefined>>;
