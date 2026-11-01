import FrameChat from '@Components/FrameChat';
import OverlayChat from '@Components/OverlayChat';
import { useMainStore } from '@Stores/index';
import { observer } from 'mobx-react-lite';

const Chat = observer(() => {
    const mainStore = useMainStore();
    if (!mainStore.setting.get('enable')) return null;

    switch (mainStore.setting.get('chat_style')) {
        case 0:
            return <OverlayChat />;
        case 1:
            return <FrameChat />;
        default:
            return null;
    }
});

export default Chat;
