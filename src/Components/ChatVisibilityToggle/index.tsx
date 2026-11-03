import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { classes } from '@Utils/index';
import styles from './style.module.less';

type Props = {
    visible: boolean;
    onToggle: () => void;
    children: ReactNode;
};

const ChatVisibilityToggle = ({ visible, onToggle, children }: Props) => {
    const areaRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const hideTimer = useRef<number | null>(null);
    const [isControlVisible, setIsControlVisible] = useState(false);

    const showControl = useCallback(() => {
        if (hideTimer.current !== null) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        setIsControlVisible(true);
    }, []);

    const hideControlLater = useCallback(() => {
        if (hideTimer.current !== null) return;
        hideTimer.current = window.setTimeout(() => {
            hideTimer.current = null;
            setIsControlVisible(false);
        }, 2000);
    }, []);

    useEffect(() => {
        const containsPoint = (element: Element | null, x: number, y: number) => {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (
                containsPoint(areaRef.current, event.clientX, event.clientY) ||
                containsPoint(buttonRef.current, event.clientX, event.clientY)
            ) {
                showControl();
            } else if (isControlVisible) {
                hideControlLater();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            if (hideTimer.current !== null) clearTimeout(hideTimer.current);
        };
    }, [hideControlLater, isControlVisible, showControl]);

    return (
        <div
            ref={areaRef}
            className={styles.ChatArea}
            style={{ pointerEvents: visible ? 'auto' : 'none' }}
            onMouseEnter={showControl}
            onMouseLeave={hideControlLater}>
            <div
                className={styles.Messages}
                style={{ visibility: visible ? 'visible' : 'hidden' }}
                aria-hidden={!visible}>
                {children}
            </div>
            <button
                ref={buttonRef}
                type="button"
                data-chat-visibility-toggle
                className={classes(styles.Toggle, isControlVisible ? styles.Visible : false)}
                style={{ pointerEvents: isControlVisible ? 'auto' : 'none' }}
                aria-label={visible ? '채팅 숨기기' : '채팅 표시'}
                aria-pressed={visible}
                title={visible ? '채팅 숨기기' : '채팅 표시'}
                onMouseEnter={showControl}
                onMouseLeave={hideControlLater}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    showControl();
                    onToggle();
                }}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                    {visible ? <circle cx="12" cy="12" r="3" /> : <path d="m3 3 18 18" />}
                </svg>
            </button>
        </div>
    );
};

export default ChatVisibilityToggle;
