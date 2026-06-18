import { useEffect, useRef, useState } from 'react';
import SettingMenu from '@Components/SettingMenu';
import SettingTemplate from '@Templates/SettingTemplate';
import { useMainStore } from './Stores';
import { I_CONTENT, T_SETTING } from './@types';
import ChatTemplate from '@Templates/ChatTemplate';

const COLORS = ['#f28ca5', '#9dd9a5', '#fff08c', '#a1b1eb', '#fac098', '#c88ed9', '#a2f7f7', '#f798f2', '#ddfa85'];

const App = () => {
    const mainStore = useMainStore();
    const [isSetting, IsSetting] = useState(false);
    const [isInit, IsInit] = useState(false);
    const colorIdxRef = useRef(0);
    const processedChats = useRef(new WeakSet<Element>());
    const chatObserver = useRef<MutationObserver | null>(null);
    const observedChatArea = useRef<Element | null>(null);
    const retryTimer = useRef<number | null>(null);

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

    const processChatItem = (chat: Element) => {
        if (processedChats.current.has(chat)) return;

        // chat = _item_sg7hy_7 (item 레벨)
        // 닉네임: button._nickname_* 의 textContent (img alt="" 이므로 텍스트만 남음)
        const usernameElement =
            chat.querySelector('button[class*="nickname"]') ??
            chat.querySelector('[class*="live_chatting_username_nickname"] [class*="name_text"]');
        const username = usernameElement?.textContent?.trim() || null;

        // 메시지: _chatting_message_* 의 직접 자식 span (> 로 닉네임 내부 span 배제)
        const messageElement =
            chat.querySelector('[class*="chatting_message"] > span[class*="text"]') ??
            chat.querySelector('[class*="live_chatting_message_text"]');

        if (!username || !messageElement || !(messageElement instanceof HTMLElement)) return;

        processedChats.current.add(chat);

        const contentArray: I_CONTENT[] = [];
        messageElement.childNodes.forEach((node: ChildNode) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent?.trim();
                if (textContent) contentArray.push({ type: 'text', content: textContent });
            } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'IMG') {
                const imgSrc = (node as HTMLImageElement).getAttribute('src');
                if (imgSrc) contentArray.push({ type: 'image', content: imgSrc });
            }
        });

        if (contentArray.length === 0) return;

        const idx = colorIdxRef.current;
        mainStore.addChat({ id: mainStore.chatId + 1, username, contentArray, color: COLORS[idx] });
        colorIdxRef.current = idx >= COLORS.length - 1 ? 0 : idx + 1;
    };

    const disconnectObserver = () => {
        if (chatObserver.current) {
            chatObserver.current.disconnect();
            chatObserver.current = null;
        }
        observedChatArea.current = null;
    };

    const observeChatArea = () => {
        addZIndexToElements();

        // 감시 중인 요소가 DOM에서 제거된 경우(방송 종료/재시작) 상태 초기화
        if (observedChatArea.current && !observedChatArea.current.isConnected) {
            disconnectObserver();
        }

        // 새 구조: aside#aside-chatting > [role="log"] > firstElementChild (= _wrapper_sg7hy_25)
        // DOM: [role="log"] 자식: [0]=wrapper [1]=floating [2]=layer
        // wrapper 를 직접 관찰해야 item 추가를 childList로 감지 가능
        let chatArea: Element | null = null;
        const asideChatting = document.querySelector('aside#aside-chatting');
        if (asideChatting) {
            const chatLog = asideChatting.querySelector('[role="log"]');
            chatArea = (chatLog?.firstElementChild as Element) ?? null;
        }
        if (!chatArea) {
            const chatAreaElements = document.querySelectorAll('[class*="live_chatting_list_wrapper"]');
            chatArea = chatAreaElements[chatAreaElements.length - 1] ?? null;
        }

        if (!chatArea) {
            if (retryTimer.current) clearTimeout(retryTimer.current);
            retryTimer.current = window.setTimeout(observeChatArea, 1000);
            return;
        }

        if (observedChatArea.current === chatArea) return;

        disconnectObserver();
        observedChatArea.current = chatArea;

        // 기존 항목은 중복 방지용으로 WeakSet에만 등록 (item 레벨로 마킹)
        Array.from(chatArea.children).forEach((el) => {
            processedChats.current.add(el);
        });

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'childList') continue;
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    const elem = node as Element;
                    // elem = _item_sg7hy_7: chatting_message 를 포함하는지 확인
                    if (elem.querySelector('[class*="chatting_message"]')) {
                        processChatItem(elem);
                    } else if (elem.matches('[class*="live_chatting_list_item"]')) {
                        processChatItem(elem);
                    } else {
                        elem.querySelectorAll('[class*="live_chatting_list_item"]').forEach(processChatItem);
                    }
                });
            }
        });

        observer.observe(chatArea, { childList: true, subtree: false });
        chatObserver.current = observer;
    };

    useEffect(() => {
        initSetting();
        observeChatArea();

        const fallbackTimer = setInterval(observeChatArea, 3000);

        return () => {
            clearInterval(fallbackTimer);
            if (retryTimer.current) clearTimeout(retryTimer.current);
            disconnectObserver();
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
