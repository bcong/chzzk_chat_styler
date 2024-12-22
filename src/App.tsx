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

    const addZIndexToElements = () => {
        const bottomButtonsElement = document.querySelector('.pzp-pc__bottom-buttons') as HTMLElement | null;
        const bottomShadowElement = document.querySelector('.pzp-pc-ui-bottom-shadow.pzp-pc__bottom-shadow') as HTMLElement | null;

        if (bottomButtonsElement) {
            bottomButtonsElement.style.zIndex = '2';
        }

        if (bottomShadowElement) {
            bottomShadowElement.style.zIndex = '2';
        }
    };

    const initSetting = () => {
        GM_listValues().map((v) => {
            mainStore.setSetting(v as T_SETTING, GM_getValue(v), false);
        });
        mainStore.addChat({ id: -1, username: '제작자', contentArray: ['비콩 (github.com/bcong)'], color: '#e9ab00' });
        IsInit(true);
    };

    const checkViewChat = () => {
        const buttonElement = document.querySelector("button[class^='live_information_player_folded_button__']") as HTMLButtonElement;
        const fullScreenbuttonElement = document.querySelector("div[class^='live_information_player_control__']") as HTMLButtonElement;

        if (fullScreenbuttonElement) {
            const chatButton = fullScreenbuttonElement?.children?.[0] as HTMLButtonElement;
            chatButton?.click();
        }

        if (buttonElement) {
            if (buttonElement?.textContent == '채팅') {
                buttonElement?.click();
            }
        }
    };

    const updateChatMessages = () => {
        addZIndexToElements();
        const closeButton = document.querySelector('div[class*="live_chatting_header_wrapper"][class*="live_chatting_header_fold"]') as HTMLElement | null;

        if (closeButton && closeButton.style.display != 'none')
            closeButton.style.display = 'none';

        const chatAreaElements = document.querySelectorAll('[class*="live_chatting_list_wrapper"]');
        const chatArea = chatAreaElements[chatAreaElements.length - 1];

        if (!chatArea) return;

        const chatItems = chatArea.querySelectorAll('[class*="live_chatting_list_item"]');
        const recentChats = Array.from(chatItems).slice(-mainStore.maxChats);

        if (recentChats.length <= 1) return;

        const lastChat = mainStore.lastChat();

        recentChats.forEach(chat => {
            const usernameElement = chat.querySelector('[class*="live_chatting_username_nickname"] [class*="name_text"]');
            const username = usernameElement?.textContent || null;
            const messageElement = chat.querySelector('[class*="live_chatting_message_text"]');

            if (!username || !messageElement) return;

            if (messageElement instanceof HTMLElement) {
                let id = Number(chat.id);

                if (!id) {
                    id = mainStore.chatId + 1;
                    chat?.setAttribute('id', id.toString());
                }

                if (lastChat?.id >= id) return;

                const contentArray: string[] = [];
                messageElement?.childNodes?.forEach((node: ChildNode) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const textContent = node.textContent?.trim();
                        if (textContent) {
                            contentArray.push(textContent);
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'IMG') {
                        const imgSrc = (node as HTMLImageElement).getAttribute('src');
                        if (imgSrc) {
                            contentArray.push(imgSrc);
                        }
                    }
                });

                mainStore.addChat({ id, username, contentArray, color: colors[colorIdx] });
                colorIdx == colors.length - 1 ? colorIdx = 0 : colorIdx++;
            }
        });
    };

    useEffect(() => {
        initSetting();
        checkViewChat();

        chatUpdate.current = setInterval(() => {
            updateChatMessages();
            checkViewChat();
        }, 100);

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