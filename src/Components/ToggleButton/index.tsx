import { classes } from '@Utils/index';
import styles from './style.module.less';

interface I_PROPS {
    enable: boolean
    setEnable: (isOn: boolean) => void
}

const ToggleButton: React.FC<I_PROPS> = ({
    enable = false,
    setEnable
}) => {

    const handleToggle = () => {
        setEnable(!enable);
    };

    return (
        <div className={classes(styles.ToggleButton, enable ? styles.Enable : false)} onClick={handleToggle}>
            <div className={styles.Circle} />
        </div>
    );
};

export default ToggleButton;