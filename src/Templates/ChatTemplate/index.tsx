import FrameChat from "@Components/FrameChat";
import OverlayChat from "@Components/OverlayChat";
import { useMainStore } from "@Stores/index";
import { colors, extractID, getCookie, parseMessage } from "@Utils/index";
import { ChzzkClient } from "chzzk";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef } from "react";

const Chat = observer(() => {
    const mainStore = useMainStore();
    const enable = mainStore.setting.get('enable');
    const chat_style = mainStore.setting.get('chat_style');
    const chatUpdate = useRef<number | null>(null);
    let colorIdx = 0;
    const client = useMemo(() => {
        return new ChzzkClient({
            baseUrls: {
                chzzkBaseUrl: "https://api.chzzk.naver.com",
                gameBaseUrl: "https://comm-api.game.naver.com/nng_main",
            }
        });
    }, []);

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

    const checkPathName = () => {
        try {
            const newPathname = window.location.pathname;
            const extractedID = extractID(newPathname);
            
            addZIndexToElements();
            if (mainStore.pathName != extractedID) {
                mainStore.setPathName(extractedID);
                connectChat(extractedID);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchLiveStatus = async (newChannelId: string) => {
        try {
            const url = `https://api.chzzk.naver.com/polling/v3/channels/${newChannelId}/live-status?includePlayerRecommendContent=true`;

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            return result;
        } catch (err) {
            return null;
        }
    };

    const connectChat = async (newChannelId: string) => {
        if (mainStore.currentChat) {
            console.log('Disconnecting from current chat...');
            mainStore.currentChat.connected && await mainStore.currentChat.disconnect();
            mainStore.setCurrentChat(null);
            mainStore.clearChat();
        }

        if (!newChannelId) throw Error('Not Channel Id');

        if (!client) throw Error('Not Client');

        const status = await fetchLiveStatus(newChannelId);

        if (!status) throw Error('Not status');

        const chatChannelId = status.content.chatChannelId;

        if (!chatChannelId) throw Error('Not chatChannelId');

        const newCurrentChat = client.chat({
            channelId: newChannelId,
            chatChannelId: chatChannelId,
            pollInterval: 30 * 1000
        });

        mainStore.setCurrentChat(newCurrentChat);

        newCurrentChat.on('chat', (chat) => {
            const message = parseMessage(chat);
            mainStore.addChat({
                id: Number(`${chat.time}${Math.random()}`),
                username: chat.profile.nickname,
                contentArray: message,
                color: colors[colorIdx]
            });
            colorIdx = (colorIdx + 1) % colors.length;
        });

        console.log('Connecting to new chat...', newChannelId);
        mainStore.clearChat();
        mainStore.addChat({ id: -1, username: '제작자', contentArray: ['비콩 (github.com/bcong)'], color: '#e9ab00' });
        await newCurrentChat.connect();
    };

    useEffect(() => {
        checkPathName();

        chatUpdate.current = setInterval(() => {
            checkPathName();
        }, 1000);

        return () => {
            if (chatUpdate.current) clearInterval(chatUpdate.current);
        };
    }, []);

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