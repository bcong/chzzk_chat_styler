import { I_OPTION } from '@Types/index';
import styles from './style.module.less';
import { useState } from 'react';
import { classes } from '@Utils/index';

interface I_PROPS {
    value: number
    options: I_OPTION[]
    setValue: (value: unknown) => void
}

const ListBox: React.FC<I_PROPS> = ({
    value = 0,
    options,
    setValue
}) => {
    const [isOptions, IsOptions] = useState(false);

    const handleSetValue = (key: number) => {
        setValue(key);
        IsOptions(false);
    };

    const optionsElem = options.map(({ key, name }) => {
        const isSelected = value == key;

        return (
            <div key={key} className={classes(styles.Option, isSelected ? styles.Selected : false)} onClick={() => !isSelected && handleSetValue(key)}>
                <p>
                    {name}
                </p>
            </div>
        );
    });

    return (
        <div className={styles.ListBox} >
            <div className={styles.ListValue} onClick={() => IsOptions(!isOptions)}>
                <p>
                    {options[value].name}
                </p>
            </div>
            <div className={classes(styles.Options, isOptions ? styles.View : false)}>
                {optionsElem}
            </div>
        </div>
    );
};

export default ListBox;