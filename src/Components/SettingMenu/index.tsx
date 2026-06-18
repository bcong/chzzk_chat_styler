import React, { useEffect, useRef } from 'react';
import styles from './style.module.less';
import { I_GLOBAL_PROPS } from '@Types/index';

interface I_PROPS extends I_GLOBAL_PROPS {}

const STUDIO_LINK_SELECTOR = "a[href*='studio.chzzk.naver.com']";

const SettingMenuComponent: React.FC<I_PROPS> = ({ toggleSetting }) => {
    const id = 'chatStylerSetting';
    const selfRemoving = useRef(false);

    const findFirstBox = (): Element | null => {
        const studioLink = document.querySelector(STUDIO_LINK_SELECTOR);
        return studioLink?.parentElement ?? null;
    };

    const insertElement = (firstBox: Element) => {
        const existing = document.getElementById(id);
        if (existing) {
            selfRemoving.current = true;
            existing.remove();
            selfRemoving.current = false;
        }

        const wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.className = styles.SettingMenu;

        const button = document.createElement('button');
        button.setAttribute('tip', '채팅 스타일러 설정');

        const label = document.createElement('p');
        label.textContent = 'S';
        button.appendChild(label);
        wrapper.appendChild(button);

        firstBox.appendChild(wrapper);
        wrapper.addEventListener('click', toggleSetting);
    };

    const tryInsert = () => {
        const firstBox = findFirstBox();
        if (firstBox) insertElement(firstBox);
    };

    useEffect(() => {
        tryInsert();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'childList') continue;

                // studio 링크가 새로 추가됐을 때 (초기 로드 / 전체화면 전환 등)
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    const el = node as Element;
                    if (el.matches(STUDIO_LINK_SELECTOR) || el.querySelector(STUDIO_LINK_SELECTOR)) {
                        tryInsert();
                        break;
                    }
                }

                // 버튼이 외부에 의해 제거됐을 때
                if (!selfRemoving.current) {
                    for (const node of mutation.removedNodes) {
                        if (node.nodeType !== 1) continue;
                        const el = node as Element;
                        if (el.id === id || el.querySelector(`#${id}`)) {
                            tryInsert();
                            break;
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return null;
};

export default SettingMenuComponent;
