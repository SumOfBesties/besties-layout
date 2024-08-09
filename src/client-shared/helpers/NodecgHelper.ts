import { MessageInputMap, MessageResultMap } from 'types/messages';

export async function sendMessage<K extends keyof MessageInputMap>(
    message: K,
    data?: MessageInputMap[K]
): Promise<MessageResultMap[K]> {
    return nodecg.sendMessage(message, data);
}
