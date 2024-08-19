import { InjectionKey, Ref } from 'vue';
import ScheduleItemEditor from '../components/ScheduleItemEditor.vue';
import CountrySelectDialog from '../components/CountrySelectDialog.vue';

export const ScheduleItemEditorInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof ScheduleItemEditor> | undefined>>;
export const CountrySelectDialogInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof CountrySelectDialog> | undefined>>;

export const MaxOmnibarBidWarItemsInjectionKey = Symbol() as InjectionKey<number>;
export const MaxOmnibarBidWarTitleWidthInjectionKey = Symbol() as InjectionKey<number>;
