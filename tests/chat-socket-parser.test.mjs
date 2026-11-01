import assert from 'node:assert/strict';
import { parseChatSocketMessage } from '../src/Utils/chatSocket.ts';

const emojiToken = 'emote+1';
const liveChat = {
    profile: JSON.stringify({ nickname: 'viewer' }),
    msg: `hello ${emojiToken}!`,
    msgTypeCode: 1,
    msgStatusType: 'NORMAL',
    extras: JSON.stringify({ emojis: { [emojiToken]: 'https://cdn.example/emote.png' } }),
};

assert.deepEqual(parseChatSocketMessage(JSON.stringify({ cmd: 93101, bdy: [liveChat] })), [
    {
        username: 'viewer',
        contentArray: [
            { type: 'text', content: 'hello' },
            { type: 'image', content: 'https://cdn.example/emote.png' },
            { type: 'text', content: '!' },
        ],
    },
]);

assert.deepEqual(
    parseChatSocketMessage(
        JSON.stringify({
            cmd: 93102,
            bdy: [{ profile: null, extras: JSON.stringify({ nickname: 'donor' }), msg: 'thanks' }],
        }),
    ),
    [{ username: 'donor', contentArray: [{ type: 'text', content: 'thanks' }] }],
);
assert.deepEqual(parseChatSocketMessage(JSON.stringify({ cmd: 15101, bdy: { messageList: [liveChat] } })), []);
assert.deepEqual(
    parseChatSocketMessage(JSON.stringify({ cmd: 93101, bdy: [{ ...liveChat, msgStatusType: 'HIDDEN' }] })),
    [],
);
assert.throws(() => parseChatSocketMessage('{'), SyntaxError);

console.log('Chat socket parser check passed');
