import styles from "./Robot.module.css";

interface RobotProps {
    isTalking?: boolean;
}

export default function Robot({ isTalking = false }: RobotProps) {
    return (
        <div className={styles.robot}>
            {/* Head (oversized, cute) */}
            <div className={styles.head}>
                {/* Ears */}
                <div className={styles.earLeft}>
                    <div className={styles.earTip} />
                </div>
                <div className={styles.earRight}>
                    <div className={styles.earTip} />
                </div>

                {/* Face area */}
                <div className={styles.face}>
                    {/* Eyes (big, adorable) */}
                    <div className={`${styles.eye} ${isTalking ? styles.eyeActive : ""}`}>
                        <div className={styles.pupil} />
                        <div className={styles.eyeShine} />
                    </div>
                    <div className={`${styles.eye} ${isTalking ? styles.eyeActive : ""}`}>
                        <div className={styles.pupil} />
                        <div className={styles.eyeShine} />
                    </div>
                </div>

                {/* Cheeks */}
                <div className={`${styles.cheek} ${styles.cheekLeft}`} />
                <div className={`${styles.cheek} ${styles.cheekRight}`} />

                {/* Mouth */}
                <div className={`${styles.mouth} ${isTalking ? styles.mouthTalking : ""}`} />
            </div>

            {/* Tiny body */}
            <div className={styles.body}>
                {/* Arms */}
                <div className={`${styles.armLeft} ${isTalking ? styles.armTalking : ""}`} />
                <div className={`${styles.armRight} ${isTalking ? styles.armTalking : ""}`} />

                {/* Belly light */}
                <div className={`${styles.belly} ${isTalking ? styles.bellyTalking : ""}`} />
            </div>

            {/* Tiny feet */}
            <div className={styles.feet}>
                <div className={styles.foot} />
                <div className={styles.foot} />
            </div>

            {/* Shadow */}
            <div className={styles.shadow} />
        </div>
    );
}
