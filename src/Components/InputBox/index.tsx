import { useState } from 'react';
import styles from './style.module.less';
import { classes } from '@Utils/index';

interface I_PROPS {
    value: number | string
    type?: string
    max?: number
    min?: number
    setValue: (value: unknown) => void
}

const InputBox: React.FC<I_PROPS> = ({
    value,
    type,
    max,
    min,
    setValue
}) => {
    const [tip, setTip] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue: number | string = e.target.value;

        if (e.target.type == 'number') {
            if (!/^\d*$/.test(newValue)) return;

            if (newValue.length > 1 && newValue.startsWith('0')) {
                newValue = newValue.replace(/^0+/, '');
            }

            newValue = Number(newValue);

            if (max && max < newValue || min && min > newValue) {
                setTip(`${min} ~ ${max} 사이 값을 입력해주세요.`);
            } else {
                setTip('');
            }
        }

        setValue(newValue);
    };

    return (
        <div className={styles.InputBox}>
            <div className={styles.InputValue}>
                <input type={type} value={String(value)} onChange={handleChange} />
            </div>
            <div className={classes(styles.Tip, tip.length > 0 ? styles.View : false)}>
                <p>
                    {tip}
                </p>
            </div>
        </div>
    );
};

export default InputBox;