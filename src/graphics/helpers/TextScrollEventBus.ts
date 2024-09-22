import mitt, { Emitter } from 'mitt';
import { App, InjectionKey } from 'vue';

export const TextScrollEventBusInjectionKey = Symbol() as InjectionKey<Emitter<{ scroll: null }>>

export function initTextScrollEventBus(app: App) {
    const emitter = mitt<{ scroll: null }>();
    setInterval(() => emitter.emit('scroll', null), 150);
    app.provide(TextScrollEventBusInjectionKey, emitter);
}
