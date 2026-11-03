import assert from 'node:assert/strict';
import {
    getOverlayChatSide,
    isChatPlayerFullscreen,
    shouldFloatChat,
    shouldRenderChat,
    shouldShowFullscreenChat,
} from '../src/Utils/chatVisibility.ts';

assert.equal(shouldRenderChat(false, false), false);
assert.equal(shouldRenderChat(true, false), true);
assert.equal(shouldRenderChat(false, true), true);
assert.equal(shouldFloatChat(false), true);
assert.equal(shouldFloatChat(true), false);
assert.equal(getOverlayChatSide(0, 500, 1000), 'left');
assert.equal(getOverlayChatSide(600, 300, 1000), 'right');
assert.equal(shouldShowFullscreenChat(false, false), true);
assert.equal(shouldShowFullscreenChat(true, false), false);
assert.equal(shouldShowFullscreenChat(true, true), true);
assert.equal(isChatPlayerFullscreen(null, null, false), false);
assert.equal(isChatPlayerFullscreen(null, {}, true), true);
const fullscreenElement = { contains: () => false };
const playerArea = { contains: (element) => element === fullscreenElement };
assert.equal(isChatPlayerFullscreen(fullscreenElement, playerArea, false), true);
const fullscreenWrapper = { contains: (element) => element === playerArea };
assert.equal(isChatPlayerFullscreen(fullscreenWrapper, playerArea, false), true);

console.log('Chat visibility check passed');
