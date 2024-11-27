import { useEffect, useRef, useState } from 'react';
import SettingMenu from '@Components/SettingMenu';
import SettingTemplate from '@Templates/SettingTemplate';
import { useMainStore } from './Stores';
import { T_SETTING } from './@types';
import ChatTemplate from '@Templates/ChatTemplate';

const App = () => {
    const mainStore = useMainStore();
    const [isSetting, IsSetting] = useState(false);
    const [isInit, IsInit] = useState(false);
    const chatUpdate = useRef<number | null>(null);
    let colorIdx = 0;

    const colors = [
        '#f28ca5',
        '#9dd9a5',
        '#fff08c',
        '#a1b1eb',
        '#fac098',
        '#c88ed9',
        '#a2f7f7',
        '#f798f2',
        '#ddfa85',
    ];

    const toggleSetting = () => {
        IsSetting((prevIsSetting) => !prevIsSetting);
    };

    const initSetting = () => {
        GM_listValues().map((v) => {
            mainStore.setSetting(v as T_SETTING, GM_getValue(v), false);
        });
        mainStore.addChat({ id: -1, username: '제작자', messageText: '비콩 (github.com/bcong)', color: '#e9ab00' });
        IsInit(true);
    };

    const updateChatMessages = () => {
        const chatAreaElements = document.querySelectorAll('#chat_area');

        const chatArea = chatAreaElements[chatAreaElements.length - 1];

        if (!chatArea) return;

        const chatItems = chatArea.querySelectorAll('.chatting-list-item');
        const recentChats = Array.from(chatItems).slice(-10);

        if (recentChats.length <= 1) return;

        const lastChat = mainStore.lastChat();

        recentChats.forEach(chat => {
            const username = chat.querySelector('.username .author')?.textContent || null;
            const message = chat.querySelector('.message-text');

            if (!username || !message) return;

            const id = Number(message?.id) || 0;

            if (lastChat.id >= id) return;

            const messageText = chat.querySelector('.msg')?.textContent || '';

            mainStore.addChat({ id, username, messageText, color: colors[colorIdx] });
            colorIdx == colors.length - 1 ? colorIdx = 0 : colorIdx++;
        });
    };

    const checkViewChat = () => {
        const buttonElement = document.querySelector(".view_ctrl .btn_chat") as HTMLLIElement;

        if (!buttonElement) return;
        const computedStyle = window.getComputedStyle(buttonElement) as CSSStyleDeclaration;
        const button = buttonElement.querySelector("button") as HTMLButtonElement;

        if (!button) return;

        computedStyle.display == 'block' && button.click();
    };

    useEffect(() => {
        initSetting();
        checkViewChat();

        chatUpdate.current = setInterval(() => {
            updateChatMessages();
        }, 300);

        return () => {
            if (chatUpdate.current) clearInterval(chatUpdate.current);
        };
    }, []);

    return (
        isInit && <>
            <SettingMenu isSetting={isSetting} toggleSetting={toggleSetting} />
            <SettingTemplate isSetting={isSetting} toggleSetting={toggleSetting} />
            <ChatTemplate />
        </>
    );
};

export default App;