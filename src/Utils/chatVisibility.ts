export const findChatPlayerArea = (): Element | null => {
    const playerLayout = document.querySelector('#live_player_layout');
    const preAdPlayer = document.querySelector('#preAdPlayerWrapper');
    return playerLayout ?? preAdPlayer?.parentElement ?? null;
};

export const shouldRenderChat = (hasPlayer: boolean, hasSeenPlayer: boolean): boolean => hasPlayer || hasSeenPlayer;

export const shouldFloatChat = (hasPlayer: boolean): boolean => !hasPlayer;
