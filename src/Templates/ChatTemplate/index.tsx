import FrameChat from '@Components/FrameChat';
import OverlayChat from '@Components/OverlayChat';
import { useMainStore } from '@Stores/index';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';

const Chat = observer(() => {
    const mainStore = useMainStore();
    const enable = mainStore.setting.get('enable');
    const chat_style = mainStore.setting.get('chat_style');
    const defalut_chat_enable = mainStore.setting.get('defalut_chat_enable');
    const chatUpdate = useRef<number | null>(null);
    const foldButtonRef = useRef<HTMLButtonElement | null>(null);
    const [pathname, setPathname] = useState('');
    const [chatEnable, setChatEnable] = useState(null);

    const syncFoldButton = () => {
        const foldButton = document.querySelector("button[aria-label='채팅 접기']") as HTMLButtonElement | null;
        if (!foldButton || foldButtonRef.current === foldButton) return;
        foldButtonRef.current = foldButton;
        foldButton.addEventListener('click', () => {
            mainStore.setSetting('defalut_chat_enable', false, true);
        });
    };

    const checkEnableChat = () => {
        try {
            const chatElement = document.querySelector("div[class^='live_chatting_list_wrapper__']") as HTMLElement;
            if (chatElement) {
                if (chatElement.scrollHeight) chatElement.scrollTop = chatElement.scrollHeight;
            }

            const newPathname = window.location.pathname;
            const sideElement = document.querySelector("aside[class^='live_chatting_container__']") as HTMLElement;

            if (defalut_chat_enable && sideElement && sideElement.offsetWidth === 0) {
                mainStore.setSetting('defalut_chat_enable', false, true);
                return;
            }

            syncFoldButton();

            if (pathname != newPathname || chatEnable != defalut_chat_enable) {
                if (sideElement && sideElement.style) {
                    sideElement.style.maxWidth = defalut_chat_enable ? '' : '0px';
                    sideElement.style.opacity = defalut_chat_enable ? '' : '0';
                    setPathname(newPathname);
                    setChatEnable(defalut_chat_enable);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        checkEnableChat();

        chatUpdate.current = setInterval(() => {
            checkEnableChat();
        }, 500);

        return () => {
            if (chatUpdate.current) clearInterval(chatUpdate.current);
        };
    }, [defalut_chat_enable, chatEnable, pathname]);

    let chatElem;
    switch (chat_style) {
        case 0:
            chatElem = <OverlayChat />;
            break;
        case 1:
            chatElem = <FrameChat />;
            break;
    }

    return enable && chatElem;
});

export default Chat;
