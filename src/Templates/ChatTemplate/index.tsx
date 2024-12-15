import FrameChat from "@Components/FrameChat";
import OverlayChat from "@Components/OverlayChat";
import { useMainStore } from "@Stores/index";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";

const Chat = observer(() => {
    const mainStore = useMainStore();
    const enable = mainStore.setting.get('enable');
    const chat_style = mainStore.setting.get('chat_style');
    const defalut_chat_enable = mainStore.setting.get('defalut_chat_enable');
    const chatUpdate = useRef<number | null>(null);
    const [pathname, setPathname] = useState('');

    const checkEnableChat = () => {
        try {
            const newPathname = window.location.pathname;
            const chatElement = document.querySelector("div[class^='live_chatting_list_wrapper__']") as HTMLElement;

            if (chatElement) {
                chatElement.scrollTop = chatElement.scrollHeight;
            }

            if (pathname != newPathname) {
                const sideElement = document.querySelector("aside[class^='live_chatting_container__']") as HTMLElement;
                if (sideElement) {
                    sideElement.style.maxWidth = defalut_chat_enable ? '' : '0px';
                    setPathname(newPathname);
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
        }, 100);

        return () => {
            if (chatUpdate.current) clearInterval(chatUpdate.current);
        };
    }, [defalut_chat_enable, pathname]);

    let chatElem;
    switch (chat_style) {
        case 0:
            chatElem = <OverlayChat />;
            break;
        case 1:
            chatElem = <FrameChat />;
            break;
    }

    return (
        enable && chatElem
    );
});

export default Chat;