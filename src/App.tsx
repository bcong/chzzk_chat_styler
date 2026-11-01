import { useEffect, useRef, useState } from 'react';
import SettingMenu from '@Components/SettingMenu';
import SettingTemplate from '@Templates/SettingTemplate';
import { useMainStore } from './Stores';
import { T_SETTING } from './@types';
import ChatTemplate from '@Templates/ChatTemplate';
import { chatSocketMessages, installChatSocketHook, parseChatSocketMessage } from './Utils/chatSocket';
import { installChatPipHook } from './Utils/chatPip';
import { log } from './Utils';

const COLORS = ['#f28ca5', '#9dd9a5', '#fff08c', '#a1b1eb', '#fac098', '#c88ed9', '#a2f7f7', '#f798f2', '#ddfa85'];

installChatSocketHook();
installChatPipHook();

const App = () => {
    const mainStore = useMainStore();
    const [isSetting, IsSetting] = useState(false);
    const [isInit, IsInit] = useState(false);
    const colorIdxRef = useRef(0);

    const toggleSetting = () => {
        IsSetting((prevIsSetting) => !prevIsSetting);
    };

    const addZIndexToElements = () => {
        const bottomButtonsElement = document.querySelector('.pzp-pc__bottom-buttons') as HTMLElement | null;
        const bottomShadowElement = document.querySelector(
            '.pzp-pc-ui-bottom-shadow.pzp-pc__bottom-shadow',
        ) as HTMLElement | null;

        if (bottomButtonsElement) bottomButtonsElement.style.zIndex = '2';
        if (bottomShadowElement) bottomShadowElement.style.zIndex = '2';
    };

    const initSetting = () => {
        GM_listValues().map((v) => {
            mainStore.setSetting(v as T_SETTING, GM_getValue(v), false);
        });
        mainStore.addChat({
            id: -1,
            username: '제작자',
            contentArray: [{ type: 'text', content: '비콩 (github.com/bcong)' }],
            color: '#e9ab00',
        });
        IsInit(true);
    };

    const handleChatSocketMessage = (event: Event) => {
        if (!(event instanceof CustomEvent) || typeof event.detail !== 'string') return;

        let chats: ReturnType<typeof parseChatSocketMessage>;
        try {
            chats = parseChatSocketMessage(event.detail);
        } catch (error) {
            log(error);
            return;
        }

        chats.forEach(({ username, contentArray }) => {
            const idx = colorIdxRef.current;
            mainStore.addChat({ id: mainStore.chatId + 1, username, contentArray, color: COLORS[idx] });
            colorIdxRef.current = idx >= COLORS.length - 1 ? 0 : idx + 1;
        });
    };

    useEffect(() => {
        initSetting();
        addZIndexToElements();
        chatSocketMessages.addEventListener('chat', handleChatSocketMessage);

        const fallbackTimer = setInterval(addZIndexToElements, 3000);

        return () => {
            clearInterval(fallbackTimer);
            chatSocketMessages.removeEventListener('chat', handleChatSocketMessage);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        isInit && (
            <>
                <SettingMenu isSetting={isSetting} toggleSetting={toggleSetting} />
                <SettingTemplate isSetting={isSetting} toggleSetting={toggleSetting} />
                <ChatTemplate />
            </>
        )
    );
};

export default App;
