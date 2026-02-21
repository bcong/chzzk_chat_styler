import React, { useEffect, useRef } from 'react';
import styles from './style.module.less';
import { I_GLOBAL_PROPS } from '@Types/index';

interface I_PROPS extends I_GLOBAL_PROPS {}

const TOOLBAR_SELECTOR = "div[class^='toolbar_section__']";

const SettingMenuComponent: React.FC<I_PROPS> = ({ toggleSetting }) => {
    const id = 'chatStylerSetting';
    const selfRemoving = useRef(false);

    const insertElement = (toolbar: Element) => {
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

        toolbar.insertBefore(wrapper, toolbar.firstChild);
        wrapper.addEventListener('click', toggleSetting);
    };

    const tryInsert = () => {
        const toolbar = document.querySelector(TOOLBAR_SELECTOR);
        if (toolbar) insertElement(toolbar);
    };

    useEffect(() => {
        tryInsert();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'childList') continue;

                // toolbar가 새로 추가됐을 때 (초기 로드 / 전체화면 전환 등)
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    const el = node as Element;
                    if (el.matches(TOOLBAR_SELECTOR) || el.querySelector(TOOLBAR_SELECTOR)) {
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
