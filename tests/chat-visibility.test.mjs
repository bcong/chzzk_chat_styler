import assert from 'node:assert/strict';
import { shouldFloatChat, shouldRenderChat } from '../src/Utils/chatVisibility.ts';

assert.equal(shouldRenderChat(false, false), false);
assert.equal(shouldRenderChat(true, false), true);
assert.equal(shouldRenderChat(false, true), true);
assert.equal(shouldFloatChat(false, false), true);
assert.equal(shouldFloatChat(true, true), true);
assert.equal(shouldFloatChat(true, false), false);

console.log('Chat visibility check passed');
