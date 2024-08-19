import { InjectionKey, Ref } from 'vue';
import ScheduleItemEditor from '../components/ScheduleItemEditor.vue';
import CountrySelectDialog from '../components/CountrySelectDialog.vue';
import TalentItemEditDialog from '../components/TalentItemEditDialog.vue';

export const ScheduleItemEditorInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof ScheduleItemEditor> | undefined>>;
export const CountrySelectDialogInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof CountrySelectDialog> | undefined>>;
export const TalentItemEditDialogInjectionKey = Symbol() as InjectionKey<Ref<InstanceType<typeof TalentItemEditDialog> | undefined>>;

export const MaxOmnibarBidWarItemsInjectionKey = Symbol() as InjectionKey<number>;
export const MaxOmnibarBidWarTitleWidthInjectionKey = Symbol() as InjectionKey<number>;
