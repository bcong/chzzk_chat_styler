import React, { useState, useRef } from 'react';
import styles from './style.module.less';

interface I_PROPS {
    value: number
    min?: number
    max?: number
    setValue: (value: unknown) => void
}

const SliderBar: React.FC<I_PROPS> = ({
    value,
    min = 0,
    max = 0,
    setValue
}) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent) => {
        if (!sliderRef.current) return;

        const slider = sliderRef.current;
        const rect = slider.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const newValue = Math.min(Math.max(min, offsetX / rect.width * max), max);
        setValue(Math.round(newValue));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        handleMouseMove(e.nativeEvent as MouseEvent);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener(
            'mouseup',
            () => {
                document.removeEventListener('mousemove', handleMouseMove);
            },
            { once: true }
        );
    };

    return (
        <div className={styles.SliderBar}>
            <div className={styles.SliderTrack} ref={sliderRef} onMouseDown={handleMouseDown}>
                <div className={styles.SliderThumb} data-value={value} style={{ left: `${(value / max) * 100}%` }} />
                <div className={styles.SliderFilled} style={{ width: `${(value / max) * 100}%` }} />
            </div>
        </div>
    );
};

export default SliderBar;