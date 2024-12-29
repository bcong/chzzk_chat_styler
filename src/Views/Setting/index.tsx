import ToggleButton from '@Components/ToggleButton';
import styles from './style.module.less';
import ListBox from '@Components/ListBox';
import { useMainStore } from '@Stores/index';
import { observer } from 'mobx-react-lite';
import { I_OPTION, I_SETTINGS } from '@Types/index';
import InputBox from '@Components/InputBox';
import SliderBar from '@Components/SliderBar';

const Setting = observer(() => {
    const mainStore = useMainStore();
    const chat_style = mainStore.setting.get('chat_style');

    const opitons: I_OPTION[] = [
        {
            key: 0,
            name: '오버레이'
        },
        {
            key: 1,
            name: '프레임'
        }
    ];

    const frameChatPositionOpitons: I_OPTION[] = [
        {
            key: 0,
            name: '좌측 상단',
        },
        {
            key: 1,
            name: '좌측 하단',
        },
        {
            key: 2,
            name: '우측 상단',
        },
        {
            key: 3,
            name: '우측 하단',
        },
    ];

    const settingList: I_SETTINGS[] = [
        {
            name: '스타일러 활성화',
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('enable'),
                    cb: (value: unknown) => mainStore.setSetting('enable', value, true)
                }
            ]
        },
        // {
        //     name: '기존 채팅 표시',
        //     values: [
        //         {
        //             type: 'toggle',
        //             value: mainStore.setting.get('defalut_chat_enable'),
        //             cb: (value: unknown) => mainStore.setSetting('defalut_chat_enable', value, true)
        //         }
        //     ]
        // },
        {
            name: '채팅창 스타일',
            values: [
                {
                    type: 'list',
                    value: mainStore.setting.get('chat_style'),
                    options: opitons,
                    cb: (value: unknown) => mainStore.setSetting('chat_style', value, true)
                }
            ]
        },

        // 오버레이
        {
            name: '채팅 표시 개수',
            disable: chat_style != 0,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('overlay_view_count'),
                    min: 1,
                    max: mainStore.maxChats,
                    cb: (value: unknown) => mainStore.setSetting('overlay_view_count', value, true)
                }
            ]
        },
        {
            name: '채팅 길이',
            disable: chat_style != 0,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('overlay_view_width'),
                    min: 100,
                    max: 500,
                    cb: (value: unknown) => mainStore.setSetting('overlay_view_width', value, true)
                }
            ]
        },
        {
            name: '폰트 크기',
            disable: chat_style != 0,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('overlay_font_size'),
                    min: 10,
                    max: 28,
                    cb: (value: unknown) => mainStore.setSetting('overlay_font_size', value, true)
                }
            ]
        },
        {
            name: '닉네임 랜덤 색상',
            disable: chat_style != 0,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('overlay_random_username'),
                    cb: (value: unknown) => mainStore.setSetting('overlay_random_username', value, true)
                }
            ]
        },
        {
            name: '채팅 메시지 정렬',
            disable: chat_style != 0,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('overlay_sort_chat_messages'),
                    cb: (value: unknown) => mainStore.setSetting('overlay_sort_chat_messages', value, true)
                }
            ]
        },
        {
            name: '채팅 배경 표시',
            disable: chat_style != 0,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('overlay_chat_background'),
                    cb: (value: unknown) => mainStore.setSetting('overlay_chat_background', value, true)
                }
            ]
        },
        {
            name: '채팅 배경 투명도',
            disable: chat_style != 0,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('overlay_chat_opacity'),
                    min: 0,
                    max: 100,
                    cb: (value: unknown) => mainStore.setSetting('overlay_chat_opacity', value, true)
                }
            ]
        },
        {
            name: '배경 표시',
            disable: chat_style != 0,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('overlay_background'),
                    cb: (value: unknown) => mainStore.setSetting('overlay_background', value, true)
                }
            ]
        },
        {
            name: '배경 투명도',
            disable: chat_style != 0,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('overlay_background_opacity'),
                    min: 0,
                    max: 100,
                    cb: (value: unknown) => mainStore.setSetting('overlay_background_opacity', value, true)
                }
            ]
        },
        {
            name: '배경 영역',
            disable: chat_style != 0,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('overlay_background_area'),
                    min: 0,
                    max: 100,
                    cb: (value: unknown) => mainStore.setSetting('overlay_background_area', value, true)
                }
            ]
        },

        // 프레임
        {
            name: '채팅창 위치',
            disable: chat_style != 1,
            values: [
                {
                    type: 'list',
                    value: mainStore.setting.get('frame_chat_position'),
                    options: frameChatPositionOpitons,
                    cb: (value: unknown) => mainStore.setSetting('frame_chat_position', value, true)
                }
            ]
        },
        {
            name: '채팅 표시 개수',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_view_count'),
                    min: 1,
                    max: mainStore.maxChats,
                    cb: (value: unknown) => mainStore.setSetting('frame_view_count', value, true)
                }
            ]
        },
        {
            name: '채팅 길이',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_view_width'),
                    min: 100,
                    max: 500,
                    cb: (value: unknown) => mainStore.setSetting('frame_view_width', value, true)
                }
            ]
        },
        {
            name: '폰트 크기',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_font_size'),
                    min: 10,
                    max: 28,
                    cb: (value: unknown) => mainStore.setSetting('frame_font_size', value, true)
                }
            ]
        },
        {
            name: '채팅 오프셋 X축',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_offset_x'),
                    min: 0,
                    max: 50,
                    cb: (value: unknown) => mainStore.setSetting('frame_offset_x', value, true)
                }
            ]
        },
        {
            name: '채팅 오프셋 Y축',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_offset_y'),
                    min: 0,
                    max: 50,
                    cb: (value: unknown) => mainStore.setSetting('frame_offset_y', value, true)
                }
            ]
        },
        {
            name: '닉네임 랜덤 색상',
            disable: chat_style != 1,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('frame_random_username'),
                    cb: (value: unknown) => mainStore.setSetting('frame_random_username', value, true)
                }
            ]
        },
        {
            name: '채팅 메시지 정렬',
            disable: chat_style != 1,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('frame_sort_chat_messages'),
                    cb: (value: unknown) => mainStore.setSetting('frame_sort_chat_messages', value, true)
                }
            ]
        },
        {
            name: '채팅 배경 표시',
            disable: chat_style != 1,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('frame_chat_background'),
                    cb: (value: unknown) => mainStore.setSetting('frame_chat_background', value, true)
                }
            ]
        },
        {
            name: '채팅 배경 투명도',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_chat_opacity'),
                    min: 0,
                    max: 100,
                    cb: (value: unknown) => mainStore.setSetting('frame_chat_opacity', value, true)
                }
            ]
        },
        {
            name: '배경 표시',
            disable: chat_style != 1,
            values: [
                {
                    type: 'toggle',
                    value: mainStore.setting.get('frame_background'),
                    cb: (value: unknown) => mainStore.setSetting('frame_background', value, true)
                }
            ]
        },
        {
            name: '배경 투명도',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_background_opacity'),
                    min: 0,
                    max: 100,
                    cb: (value: unknown) => mainStore.setSetting('frame_background_opacity', value, true)
                }
            ]
        },
        {
            name: '배경 영역',
            disable: chat_style != 1,
            values: [
                {
                    type: 'slider',
                    value: mainStore.setting.get('frame_background_area'),
                    min: 0,
                    max: 100,
                    cb: (value: unknown) => mainStore.setSetting('frame_background_area', value, true)
                }
            ]
        },
    ];

    const settingListElem = settingList.map(({ name, disable, values }, idx) => {
        if (disable) return;
        const valueElem = values.map(({ type, value, options, inputType, min, max, cb }, idx) => {

            let contentElem;
            switch (type) {
                case 'toggle':
                    contentElem = <ToggleButton enable={value} setEnable={cb} />;
                    break;
                case 'list':
                    contentElem = <ListBox value={value} options={options as I_OPTION[]} setValue={cb} />;
                    break;
                case 'input':
                    contentElem = <InputBox value={value} setValue={cb} type={inputType} min={min} max={max} />;
                    break;
                case 'slider':
                    contentElem = <SliderBar value={value} setValue={cb} min={min} max={max} />;
                    break;
            }

            return (

                <div key={idx} className={styles.Value}>
                    {contentElem}
                </div>

            );
        });

        return (
            <div key={idx} className={styles.Menu}>
                <div className={styles.Name}>
                    <p>
                        {name}
                    </p>
                </div>
                {valueElem}
            </div>
        );
    });

    return (
        <div className={styles.Setting}>
            <div className={styles.Menus}>
                {settingListElem}
            </div>
        </div>
    );
});

export default Setting;