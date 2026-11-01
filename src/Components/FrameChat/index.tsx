import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './style.module.less';
import { useMainStore } from '@Stores/index';
import { observer } from 'mobx-react-lite';
import { classes } from '@Utils/index';
import { shouldFloatChat, shouldRenderChat } from '@Utils/chatVisibility';

const FrameChat = observer(() => {
    const mainStore = useMainStore();
    const [playerSizeDiv, setPlayerSizeDiv] = useState<Element | null>(null);
    const hasSeenPlayer = useRef(false);
    const frameChatPosition = mainStore.setting.get('frame_chat_position');
    const frameRandomUsername = mainStore.setting.get('frame_random_username');
    const frameViewCount = mainStore.setting.get('frame_view_count');
    const frameChatOpacity = mainStore.setting.get('frame_chat_opacity');
    const frameBackgroundOpacity = mainStore.setting.get('frame_background_opacity');
    const frameBackgroundArea = mainStore.setting.get('frame_background_area');
    const frameChatBackground = mainStore.setting.get('frame_chat_background');
    const frameViewWidth = mainStore.setting.get('frame_view_width');
    const frameSortChatMessages = mainStore.setting.get('frame_sort_chat_messages');
    const frameFontSize = mainStore.setting.get('frame_font_size');
    const frameBackground = mainStore.setting.get('frame_background');
    const frameOffsetX = mainStore.setting.get('frame_offset_x');
    const frameOffsetY = mainStore.setting.get('frame_offset_y');
    const id = 'chatStylerFrameChat';
    const showNicknames = mainStore.setting.get('show_nicknames');

    useEffect(() => {
        const find = () => {
            const playerLayout = document.querySelector('#live_player_layout');
            const preAdPlayer = document.querySelector('#preAdPlayerWrapper');
            const player = playerLayout?.parentElement ?? preAdPlayer?.parentElement ?? playerLayout ?? preAdPlayer;

            if (player) {
                setPlayerSizeDiv(player);
            } else {
                setPlayerSizeDiv((prev) => (prev && !prev.isConnected ? null : prev));
            }
        };

        find();
        const timer = setInterval(find, 1000);
        return () => clearInterval(timer);
    }, [window.location.href]);

    useEffect(() => {
        if (playerSizeDiv) hasSeenPlayer.current = true;
    }, [playerSizeDiv]);

    const chatsElem = mainStore.chats.slice(-frameViewCount).map(({ id, username, contentArray, color }) => {
        const background = frameChatBackground ? `rgba(0, 0, 0, ${frameChatOpacity}%)` : '';
        const fontSize = `${frameFontSize}px`;

        const userNameElem = (
            <div className={styles.Username}>
                <p
                    style={{
                        color: frameRandomUsername ? color : '#9dd9a5',
                        fontSize: fontSize,
                    }}>
                    {username}
                </p>
            </div>
        );

        const messageContent = contentArray.map((content, index) => {
            if (content.type === 'image') {
                return <img key={index} src={content.content} style={{ width: fontSize, height: fontSize }} />;
            } else {
                return (
                    <p style={{ fontSize: fontSize }} key={index}>
                        {content.content}
                    </p>
                );
            }
        });

        const messageElem = (
            <div className={styles.Message}>
                <p
                    style={{
                        fontSize: fontSize,
                    }}>
                    {messageContent}
                </p>
            </div>
        );

        return (
            <div
                key={id}
                className={classes(
                    styles.Chat,
                    frameChatBackground ? styles.Background : false,
                    frameSortChatMessages ? styles.Sorted : false,
                )}
                style={{
                    width: `${frameViewWidth}px`,
                }}>
                <div
                    className={styles.MessageContainer}
                    style={{
                        background: background,
                    }}>
                    {showNicknames && userNameElem}
                    {messageElem}
                </div>
            </div>
        );
    });

    let frameChatPositionCls = '',
        frameChatDegree;
    switch (frameChatPosition) {
        case 0:
            frameChatPositionCls = styles.LeftTop;
            frameChatDegree = 180;
            break;
        case 1:
            frameChatPositionCls = styles.LeftBottom;
            frameChatDegree = 0;
            break;
        case 2:
            frameChatPositionCls = styles.RightTop;
            frameChatDegree = 180;
            break;
        case 3:
            frameChatPositionCls = styles.RightBottom;
            frameChatDegree = 0;
            break;
    }

    const chatBackgroundStyle = `linear-gradient(${frameChatDegree}deg, rgba(0, 0, 0, ${frameBackgroundOpacity}%) ${frameBackgroundArea}%, rgba(0, 0, 0, 0) 100%)`;
    if (!shouldRenderChat(!!playerSizeDiv, hasSeenPlayer.current)) return null;

    const isFloating = shouldFloatChat(!!playerSizeDiv);
    const portalTarget = playerSizeDiv && !isFloating ? playerSizeDiv : document.body;

    return ReactDOM.createPortal(
        <div
            className={classes(styles.FrameChat, frameChatPositionCls)}
            id={id}
            style={{
                background: frameBackground ? chatBackgroundStyle : '',
                position: isFloating ? 'fixed' : undefined,
                zIndex: isFloating ? 13000 : undefined,
                paddingLeft: `${frameOffsetX}px`,
                paddingRight: `${frameOffsetX}px`,
                paddingTop: `${frameOffsetY}px`,
                paddingBottom: `${frameOffsetY}px`,
            }}>
            {chatsElem}
        </div>,
        portalTarget,
    );
});

export default FrameChat;
