import FrameChat from "@Components/FrameChat";
import OverlayChat from "@Components/OverlayChat";
import { useMainStore } from "@Stores/index";
import { observer } from "mobx-react-lite";

const Chat = observer(() => {
    const mainStore = useMainStore();
    const enable = mainStore.setting.get('enable');
    const chat_style = mainStore.setting.get('chat_style');

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