import { BaseController } from '../controllers/BaseController';
import { MessageInputMap, MessageResultMap } from 'types/messages';
import { beforeEach, jest } from '@jest/globals';

export let controllerListeners:
    {[key in keyof MessageInputMap]?: (data?: unknown) => MessageResultMap[key] | Promise<MessageResultMap[key]>} = {};

beforeEach(() => {
    jest.spyOn(BaseController.prototype, 'listen').mockImplementation(
        <key extends keyof MessageInputMap>
        (name: key, callback: (data?: unknown) => any) => {
            controllerListeners[name] = callback;
        });

    controllerListeners = {};
});
