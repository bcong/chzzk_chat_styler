export const findChatPlayerArea = (): Element | null => {
    const playerLayout = document.querySelector('#live_player_layout');
    const preAdPlayer = document.querySelector('#preAdPlayerWrapper');
    return playerLayout ?? preAdPlayer?.parentElement ?? null;
};

export const shouldRenderChat = (hasPlayer: boolean, hasSeenPlayer: boolean): boolean => hasPlayer || hasSeenPlayer;

export const shouldFloatChat = (hasPlayer: boolean): boolean => !hasPlayer;

export const getOverlayChatSide = (left: number, width: number, viewportWidth: number): 'left' | 'right' =>
    left + width / 2 <= viewportWidth / 2 ? 'left' : 'right';

export const shouldShowFullscreenChat = (fullscreenOnly: boolean, isFullscreen: boolean): boolean =>
    !fullscreenOnly || isFullscreen;

export const isChatPlayerFullscreen = (
    fullscreenElement: Element | null,
    playerArea: Element | null,
    playerFullscreenClass: boolean,
): boolean => {
    if (!playerArea) return false;
    if (playerFullscreenClass) return true;

    return (
        !!fullscreenElement &&
        (fullscreenElement === playerArea ||
            fullscreenElement.contains(playerArea) ||
            playerArea.contains(fullscreenElement))
    );
};
