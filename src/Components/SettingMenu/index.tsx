import React, { useEffect } from 'react';
import styles from './style.module.less';
import { I_GLOBAL_PROPS } from '@Types/index';

interface I_PROPS extends I_GLOBAL_PROPS {}

const SettingMenuComponent: React.FC<I_PROPS> = ({ toggleSetting }) => {
    const id = 'chatStylerSetting';
    let selfRemoving = false;

    const checkAndInsertElement = () => {
        const serviceUtilElement = document.querySelector("div[class^='toolbar_section__']");

        if (!serviceUtilElement) {
            setTimeout(checkAndInsertElement, 1000);
            return;
        }

        const existingItem = document.getElementById(id);

        if (existingItem) {
            selfRemoving = true;
            existingItem.remove();
            selfRemoving = false;
        }

        const newDivElement = document.createElement('div');
        newDivElement.id = id;
        newDivElement.className = styles.SettingMenu;

        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('tip', '채팅 스타일러 설정');

        const spanElement = document.createElement('p');
        spanElement.textContent = 'S';
        buttonElement.appendChild(spanElement);

        newDivElement.appendChild(buttonElement);

        serviceUtilElement.insertBefore(newDivElement, serviceUtilElement?.firstChild);

        newDivElement.addEventListener('click', toggleSetting);

        return () => {
            newDivElement.removeEventListener('click', toggleSetting);
        };
    };

    useEffect(() => {
        checkAndInsertElement();

        const observerCallback = (mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type == 'childList') {
                    mutation.removedNodes.forEach((node) => {
                        if (selfRemoving || node.nodeType !== 1) return;
                        const el = node as Element;
                        if (el.id === id || el.querySelector?.(`#${id}`)) {
                            checkAndInsertElement();
                        }
                    });
                }
            }
        };

        const observer = new MutationObserver(observerCallback);

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
};

export default SettingMenuComponent;
