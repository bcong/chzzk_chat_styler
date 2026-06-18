import FrameChat from '@Components/FrameChat';
import OverlayChat from '@Components/OverlayChat';
import { useMainStore } from '@Stores/index';
import { classes } from '@Utils/index';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './style.module.less';

const Chat = observer(() => {
    const mainStore = useMainStore();
    const enable = mainStore.setting.get('enable');
    const chat_style = mainStore.setting.get('chat_style');
    const defalut_chat_enable = mainStore.setting.get('defalut_chat_enable');
    const chatUpdate = useRef<number | null>(null);
    const [pathname, setPathname] = useState('');
    const [chatEnable, setChatEnable] = useState(null);
    const [playerDiv, setPlayerDiv] = useState<Element | null>(null);
    const [isControlsVisible, setIsControlsVisible] = useState(false);
    const controlsObserverRef = useRef<MutationObserver | null>(null);
    const asideObserverRef = useRef<MutationObserver | null>(null);

    const getSideElement = (): HTMLElement | null =>
        (document.querySelector('aside#aside-chatting') ??
            document.querySelector("aside[class*='live_chatting_container']")) as HTMLElement | null;

    const checkEnableChat = () => {
        try {
            const foldButton = document.querySelector("button[aria-label='채팅 접기']") as HTMLButtonElement | null;
            if (foldButton && !foldButton.dataset.stylerBound) {
                foldButton.dataset.stylerBound = '1';
                foldButton.addEventListener(
                    'click',
                    (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        mainStore.setSetting('defalut_chat_enable', false, true);
                    },
                    { capture: true },
                );
            }

            const newPathname = window.location.pathname;
            const sideElement = getSideElement();

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

    // aside#aside-chatting 클래스 변화 관찰 - is_folded 상태 동기화
    useEffect(() => {
        const attachAsideObserver = () => {
            const sideEl = getSideElement();
            if (!sideEl || asideObserverRef.current) return;
            const obs = new MutationObserver(() => {
                const folded = sideEl.className.includes('is_folded');
                if (folded && mainStore.setting.get('defalut_chat_enable')) {
                    mainStore.setSetting('defalut_chat_enable', false, true);
                } else if (!folded && !mainStore.setting.get('defalut_chat_enable')) {
                    // is_folded 해제 시 - 우리가 수동 숨김한 경우가 아닐 때만 복원
                    if (sideEl.style.maxWidth !== '0px') {
                        mainStore.setSetting('defalut_chat_enable', true, true);
                    }
                }
            });
            obs.observe(sideEl, { attributes: true, attributeFilter: ['class'] });
            asideObserverRef.current = obs;
        };

        const timer = setInterval(attachAsideObserver, 1000);
        attachAsideObserver();
        return () => {
            clearInterval(timer);
            asideObserverRef.current?.disconnect();
            asideObserverRef.current = null;
        };
    }, []);

    useEffect(() => {
        const find = () => {
            const el = document.querySelector('div[aria-label="비디오 플레이어"]') || document.querySelector('.pzp-pc');
            if (el) {
                setPlayerDiv(el);
            } else {
                setTimeout(find, 500);
            }
        };
        find();
    }, []);

    useEffect(() => {
        if (!playerDiv) return;
        const update = () => setIsControlsVisible(playerDiv.classList.contains('pzp-pc--controls'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(playerDiv, { attributes: true, attributeFilter: ['class'] });
        controlsObserverRef.current = observer;
        return () => {
            observer.disconnect();
            controlsObserverRef.current = null;
        };
    }, [playerDiv]);

    let chatElem;
    switch (chat_style) {
        case 0:
            chatElem = <OverlayChat />;
            break;
        case 1:
            chatElem = <FrameChat />;
            break;
    }

    const showChatButton =
        !defalut_chat_enable &&
        playerDiv &&
        ReactDOM.createPortal(
            <button
                className={classes(styles.ShowChatButton, isControlsVisible ? styles.Visible : null)}
                onClick={(e) => {
                    e.stopPropagation();
                    mainStore.setSetting('defalut_chat_enable', true, true);
                    const sideEl = getSideElement();
                    if (sideEl?.style) {
                        sideEl.style.maxWidth = '';
                        sideEl.style.opacity = '';
                    }
                }}
                title="채팅 다시 표시">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>,
            playerDiv,
        );

    return (
        enable && (
            <>
                {chatElem}
                {showChatButton}
            </>
        )
    );
});

export default Chat;
