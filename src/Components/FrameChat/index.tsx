import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './style.module.less';
import { useMainStore } from '@Stores/index';
import { observer } from 'mobx-react-lite';
import { classes } from '@Utils/index';

const FrameChat = observer(() => {
    const mainStore = useMainStore();
    const [playerSizeDiv, setPlayerSizeDiv] = useState<Element | null>(null);
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

    useEffect(() => {
        const addFrameChat = () => {
            const div = document.querySelector('#live_player_layout');

            if (!div) {
                setTimeout(addFrameChat, 1000);
                return;
            }

            if (div) {
                setPlayerSizeDiv(div);
            }
        };

        addFrameChat();
    }, [window.location.href]);

    const chatsElem = mainStore.chats
        .slice(-frameViewCount)
        .map(({ id, username, contentArray, color }) => {
            const background = frameChatBackground ? `rgba(0, 0, 0, ${frameChatOpacity}%)` : '';
            const fontSize = `${frameFontSize}px`;

            const userNameElem = (
                <div className={styles.Username}>
                    <p style={{
                        color: frameRandomUsername ? color : '#9dd9a5',
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
                    <p style={{
                        fontSize: fontSize
                    }}>
                        {messageContent}
                    </p>
                </div>
            );

            return (
                <div key={id}
                    className={classes(styles.Chat,
                        frameChatBackground ? styles.Background : false,
                        frameSortChatMessages ? styles.Sorted : false
                    )}
                    style={{
                        width: `${frameViewWidth}px`,
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

    let frameChatPositionCls = '', frameChatDegree;
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

    return playerSizeDiv ? ReactDOM.createPortal(
        <div
            className={classes(styles.FrameChat, frameChatPositionCls)}
            style={{
                background: frameBackground ? chatBackgroundStyle : '',
                paddingLeft: `${frameOffsetX}px`,
                paddingRight: `${frameOffsetX}px`,
                paddingTop: `${frameOffsetY}px`,
                paddingBottom: `${frameOffsetY}px`
            }}>
            {chatsElem}
        </div>,
        playerSizeDiv
    ) : null;
});

export default FrameChat;