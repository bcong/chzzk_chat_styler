import type { I_CHAT, I_CONTENT } from '@Types/index';

type ParsedChat = Pick<I_CHAT, 'username' | 'contentArray'>;

export const chatSocketMessages = new EventTarget();

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export const installChatSocketHook = () => {
    unsafeWindow.WebSocket = new Proxy(unsafeWindow.WebSocket, {
        construct(target, args, newTarget) {
            const socket = Reflect.construct(target, args, newTarget) as WebSocket;
            const url = new URL(String(args[0]), unsafeWindow.location.href);

            if (url.protocol === 'wss:' && url.hostname.endsWith('.chat.naver.com') && url.pathname === '/chat') {
                socket.addEventListener('message', (event) => {
                    if (typeof event.data === 'string') {
                        chatSocketMessages.dispatchEvent(
                            new CustomEvent<string>('chat', { detail: event.data }),
                        );
                    }
                });
            }

            return socket;
        },
    });
};

export const parseChatSocketMessage = (data: string): ParsedChat[] => {
    const frame: unknown = JSON.parse(data);
    if (!isRecord(frame) || (frame.cmd !== 93101 && frame.cmd !== 93102)) return [];

    const body = frame.bdy;
    const chats: unknown[] = Array.isArray(body)
        ? body
        : isRecord(body) && Array.isArray(body.messageList)
          ? body.messageList
          : [body];

    return chats.flatMap((chat): ParsedChat[] => {
        if (!isRecord(chat) || chat.msgStatusType === 'HIDDEN' || chat.messageStatusType === 'HIDDEN') return [];

        const profile: unknown = typeof chat.profile === 'string' ? JSON.parse(chat.profile) : chat.profile;
        const extras: unknown =
            typeof chat.extras === 'string' && chat.extras ? JSON.parse(chat.extras) : chat.extras;
        const nickname = isRecord(profile) && typeof profile.nickname === 'string' ? profile.nickname : undefined;
        const extraNickname = isRecord(extras) && typeof extras.nickname === 'string' ? extras.nickname : undefined;
        const username = (nickname || extraNickname || '').trim();
        const message = typeof chat.msg === 'string' && chat.msg ? chat.msg : chat.content;

        if (!username || typeof message !== 'string' || !message.trim()) return [];

        const emojis = new Map<string, string>();
        if (isRecord(extras) && isRecord(extras.emojis)) {
            for (const token of Object.keys(extras.emojis)) {
                const url = extras.emojis[token];
                if (token && typeof url === 'string' && url.startsWith('https://')) emojis.set(token, url);
            }
        }

        const emojiPattern = [...emojis.keys()]
            .sort((a, b) => b.length - a.length)
            .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|');
        const parts = emojiPattern ? message.split(new RegExp(`(${emojiPattern})`, 'g')) : [message];
        const contentArray: I_CONTENT[] = [];

        for (const part of parts) {
            if (!part.trim()) continue;
            const image = emojis.get(part);
            contentArray.push(image ? { type: 'image', content: image } : { type: 'text', content: part.trim() });
        }

        return contentArray.length ? [{ username, contentArray }] : [];
    });
};
