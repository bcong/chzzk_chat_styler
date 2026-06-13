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
    const [isPlayerHovered, setIsPlayerHovered] = useState(false);

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

            const showButtons = document.querySelectorAll("button[class^='live_information_player_folded_button__']");
            showButtons.forEach((btn) => {
                const button = btn as HTMLButtonElement;
                if (!button.dataset.stylerBound) {
                    button.dataset.stylerBound = '1';
                    button.addEventListener(
                        'click',
                        (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            mainStore.setSetting('defalut_chat_enable', true, true);
                        },
                        { capture: true },
                    );
                }
            });

            const newPathname = window.location.pathname;
            const sideElement = document.querySelector("aside[class^='live_chatting_container__']") as HTMLElement;

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

    useEffect(() => {
        const find = () => {
            const el = document.querySelector('#live_player_layout');
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
        const onEnter = () => setIsPlayerHovered(true);
        const onLeave = () => setIsPlayerHovered(false);
        playerDiv.addEventListener('mouseenter', onEnter);
        playerDiv.addEventListener('mouseleave', onLeave);
        return () => {
            playerDiv.removeEventListener('mouseenter', onEnter);
            playerDiv.removeEventListener('mouseleave', onLeave);
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
                className={classes(styles.ShowChatButton, isPlayerHovered ? styles.Visible : null)}
                onClick={() => mainStore.setSetting('defalut_chat_enable', true, true)}
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
