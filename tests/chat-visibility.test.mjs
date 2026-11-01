import assert from 'node:assert/strict';
import { shouldFloatChat } from '../src/Utils/chatVisibility.ts';

assert.equal(shouldFloatChat(false, false), true);
assert.equal(shouldFloatChat(true, true), true);
assert.equal(shouldFloatChat(true, false), false);

console.log('Chat visibility check passed');
