import FrameChat from '@Components/FrameChat';
import OverlayChat from '@Components/OverlayChat';
import { useMainStore } from '@Stores/index';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {
    findChatPlayerArea,
    isChatPlayerFullscreen,
    shouldShowFullscreenChat,
} from '@Utils/chatVisibility';

const Chat = observer(() => {
    const mainStore = useMainStore();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        let observedArea: Element | null = null;
        let observedPlayer: Element | null = null;

        const updateFullscreen = () => {
            const playerArea = findChatPlayerArea();
            const player =
                playerArea?.matches('.pzp-pc') ? playerArea : playerArea?.querySelector('.pzp-pc') ?? null;
            const playerFullscreenClass = !!(
                playerArea?.matches('.pzp-pc--fullscreen') ||
                playerArea?.querySelector('.pzp-pc--fullscreen') ||
                player?.classList.contains('pzp-pc--fullscreen')
            );

            setIsFullscreen(
                isChatPlayerFullscreen(document.fullscreenElement, playerArea, playerFullscreenClass),
            );
        };
        const playerObserver = new MutationObserver(updateFullscreen);
        const areaObserver = new MutationObserver(updateFullscreen);

        function findPlayer() {
            const playerArea = findChatPlayerArea();
            if (playerArea !== observedArea) {
                areaObserver.disconnect();
                playerObserver.disconnect();
                observedArea = playerArea;
                if (observedArea) {
                    areaObserver.observe(observedArea, {
                        attributes: true,
                        attributeFilter: ['class'],
                    });
                }
                observedPlayer = null;
            }

            const player = playerArea?.querySelector('.pzp-pc') ?? null;
            if (player !== observedPlayer) {
                playerObserver.disconnect();
                observedPlayer = player;
                if (observedPlayer) {
                    playerObserver.observe(observedPlayer, {
                        attributes: true,
                        attributeFilter: ['class'],
                    });
                }
            }
            updateFullscreen();
        }

        document.addEventListener('fullscreenchange', updateFullscreen);
        document.addEventListener('webkitfullscreenchange', updateFullscreen);
        const interval = window.setInterval(findPlayer, 500);
        findPlayer();

        return () => {
            document.removeEventListener('fullscreenchange', updateFullscreen);
            document.removeEventListener('webkitfullscreenchange', updateFullscreen);
            clearInterval(interval);
            areaObserver.disconnect();
            playerObserver.disconnect();
        };
    }, []);

    if (!mainStore.setting.get('enable')) return null;
    const isPageVisible = shouldShowFullscreenChat(
        !!mainStore.setting.get('fullscreen_only_chat'),
        isFullscreen,
    );

    switch (mainStore.setting.get('chat_style')) {
        case 0:
            return <OverlayChat isFullscreen={isFullscreen} isPageVisible={isPageVisible} />;
        case 1:
            return <FrameChat isFullscreen={isFullscreen} isPageVisible={isPageVisible} />;
        default:
            return null;
    }
});

export default Chat;
