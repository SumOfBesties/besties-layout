import { InjectionKey, Ref } from 'vue';
import ScheduleItemEditor from '../components/ScheduleItemEditor.vue';
import CountrySelectDialog from '../components/CountrySelectDialog.vue';

export const ScheduleItemEditorInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof ScheduleItemEditor> | undefined>>;
export const CountrySelectDialogInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof CountrySelectDialog> | undefined>>;
