import FrameChat from "@Components/FrameChat";
import OverlayChat from "@Components/OverlayChat";
import { useMainStore } from "@Stores/index";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";

const Chat = observer(() => {
    const mainStore = useMainStore();
    const enable = mainStore.setting.get('enable');
    const chat_style = mainStore.setting.get('chat_style');
    const defalut_chat_enable = mainStore.setting.get('defalut_chat_enable');
    const chatUpdate = useRef<number | null>(null);
    
    const isEnableChat = () => {
        const sideElement = document.querySelector("aside[class^='live_chatting_container__']") as HTMLElement;

        if (sideElement)
            sideElement.style.width = defalut_chat_enable ? '' : '0';
    };

    useEffect(() => {
        isEnableChat();

        chatUpdate.current = setInterval(() => {
            isEnableChat();
        }, 100);

        return () => {
            if (chatUpdate.current) clearInterval(chatUpdate.current);
        };
    }, [defalut_chat_enable]);

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