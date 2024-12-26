import { observer } from 'mobx-react-lite';
import styles from './style.module.less';
import { useMainStore } from '@Stores/index';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { classes } from '@Utils/index';

const OverlayChat = observer(() => {
    const mainStore = useMainStore();
    const chatRef = useRef<HTMLDivElement | null>(null);
    const [isView, IsView] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ left: 0, top: 0 });

    const overlayViewCount = mainStore.setting.get('overlay_view_count');
    const overlayViewOpacity = mainStore.setting.get('overlay_chat_opacity');
    const overlayBackgroundOpacity = mainStore.setting.get('overlay_background_opacity');
    const overlayRandomUsername = mainStore.setting.get('overlay_random_username');
    const overlayViewWidth = mainStore.setting.get('overlay_view_width');
    const overlaySortChatMessages = mainStore.setting.get('overlay_sort_chat_messages');
    const overlayFontSize = mainStore.setting.get('overlay_font_size');
    const overlayChatBackground = mainStore.setting.get('overlay_chat_background');
    const overlayBackground = mainStore.setting.get('overlay_background');
    const overlayBackgroundArea = mainStore.setting.get('overlay_background_area');

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!chatRef.current) return;
        setIsDragging(true);
        setInitialPosition({
            x: e.clientX,
            y: e.clientY
        });
        setOffset({
            x: position.left,
            y: position.top
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !chatRef.current) return;
        const currentX = e.clientX - initialPosition.x;
        const currentY = e.clientY - initialPosition.y;

        const newLeft = offset.x + currentX;
        const newTop = offset.y + currentY;

        setPosition({ left: newLeft, top: newTop });

        chatRef.current.style.left = `${newLeft}px`;
        chatRef.current.style.top = `${newTop}px`;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        mainStore.setSetting('overlay_x', position.left, true);
        mainStore.setSetting('overlay_y', position.top, true);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [position, isDragging]);

    useEffect(() => {
        const handleResize = () => {
            if (!chatRef.current) return;

            const rect = chatRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            let newLeft = position.left;
            let newTop = position.top;

            if (rect.left < 0 || rect.right > windowWidth) {
                if (rect.left < 0) newLeft = 0;
                if (rect.right > windowWidth) newLeft = windowWidth - rect.width;
            }

            if (rect.top < 0 || rect.bottom > windowHeight) {
                if (rect.top < 0) newTop = 0;
                if (rect.bottom > windowHeight) newTop = windowHeight - rect.height;
            }

            setPosition({ left: newLeft, top: newTop });

            chatRef.current.style.left = `${newLeft}px`;
            chatRef.current.style.top = `${newTop}px`;

            mainStore.setSetting('overlay_x', newLeft, true);
            mainStore.setSetting('overlay_y', newTop, true);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [position]);

    useEffect(() => {
        if (!chatRef.current) return;

        const left = mainStore.setting.get('overlay_x') || 0;
        const top = mainStore.setting.get('overlay_y') || 0;

        setPosition({ left, top });

        chatRef.current.style.left = `${left}px`;
        chatRef.current.style.top = `${top}px`;
        IsView(true);
    }, []);

    const chatsElem = mainStore.chats
        .slice(-overlayViewCount)
        .map(({ id, username, contentArray, color }) => {
            const background = overlayChatBackground ? `rgba(0, 0, 0, ${overlayViewOpacity}%)` : '';
            const fontSize = `${overlayFontSize}px`;

            const userNameElem = (
                <div className={styles.Username}>
                    <p style={{
                        color: overlayRandomUsername ? color : '#9dd9a5',
                        fontSize: fontSize
                    }}>
                        {username}
                    </p>
                </div>
            );

            const messageContent = contentArray.map((content, index) => {
                if (content.startsWith('http')) {
                    return <img key={index} src={content} style={{ width: fontSize, height: fontSize }} />;
                } else {
                    return <p style={{ fontSize: fontSize }} key={index}>{content}</p>;
                }
            });

            const messageElem = (
                <div className={styles.Message}>
                    {messageContent}
                </div>
            );

            return (
                <div key={id}
                    className={classes(styles.Chat,
                        overlayChatBackground ? styles.Background : false,
                        overlaySortChatMessages ? styles.Sorted : false
                    )}
                    style={{
                        width: `${overlayViewWidth}px`,
                    }}
                >
                    <div className={styles.MessageContainer}
                        style={{
                            background: background
                        }}>
                        {userNameElem}
                        {messageElem}
                    </div>
                </div>
            );
        });

    const chatBackgroundStyle = `linear-gradient(0deg, rgba(0, 0, 0, ${overlayBackgroundOpacity}%) ${overlayBackgroundArea}%, rgba(0, 0, 0, 0) 100%)`;

    return (
        ReactDOM.createPortal(
            <div
                ref={chatRef}
                className={classes(styles.OverlayChat, isView ? styles.View : false)}
                onMouseDown={handleMouseDown}
                style={{
                    left: `${position.left}px`,
                    top: `${position.top}px`,
                    background: overlayBackground ? chatBackgroundStyle : '',
                }}
            >
                {chatsElem}
            </div>
            , document.body)
    );
});

export default OverlayChat;