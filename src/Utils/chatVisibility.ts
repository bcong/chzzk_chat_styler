export const shouldRenderChat = (hasPlayer: boolean, hasSeenPlayer: boolean): boolean => hasPlayer || hasSeenPlayer;

export const shouldFloatChat = (hasPlayer: boolean, isPaused: boolean): boolean => !hasPlayer || isPaused;
