import styles from "./Robot.module.css";

type RobotVariant = "openai" | "gemini" | "claude";

interface RobotProps {
    variant: RobotVariant;
    isTalking?: boolean;
}

const variantMap = {
    openai: {
        robot: styles.robotOpenai,
        head: styles.headOpenai,
        eye: styles.eyeOpenai,
        pupil: styles.pupilOpenai,
        cheek: styles.cheekOpenai,
        mouth: styles.mouthOpenai,
        earTip: styles.earTipOpenai,
        body: styles.bodyOpenai,
        belly: styles.bellyOpenai,
        arm: styles.armOpenai,
        foot: styles.footOpenai,
    },
    gemini: {
        robot: styles.robotGemini,
        head: styles.headGemini,
        eye: styles.eyeGemini,
        pupil: styles.pupilGemini,
        cheek: styles.cheekGemini,
        mouth: styles.mouthGemini,
        earTip: styles.earTipGemini,
        body: styles.bodyGemini,
        belly: styles.bellyGemini,
        arm: styles.armGemini,
        foot: styles.footGemini,
    },
    claude: {
        robot: styles.robotClaude,
        head: styles.headClaude,
        eye: styles.eyeClaude,
        pupil: styles.pupilClaude,
        cheek: styles.cheekClaude,
        mouth: styles.mouthClaude,
        earTip: styles.earTipClaude,
        body: styles.bodyClaude,
        belly: styles.bellyClaude,
        arm: styles.armClaude,
        foot: styles.footClaude,
    },
};

export default function Robot({ variant, isTalking = false }: RobotProps) {
    const v = variantMap[variant];

    return (
        <div className={`${styles.robot} ${v.robot}`}>
            {/* Head (oversized, cute) */}
            <div className={`${styles.head} ${v.head}`}>
                {/* Ears */}
                <div className={`${styles.earLeft}`}>
                    <div className={`${styles.earTip} ${v.earTip}`} />
                </div>
                <div className={`${styles.earRight}`}>
                    <div className={`${styles.earTip} ${v.earTip}`} />
                </div>

                {/* Face area */}
                <div className={styles.face}>
                    {/* Eyes (big, adorable) */}
                    <div className={`${styles.eye} ${v.eye} ${isTalking ? styles.eyeActive : ""}`}>
                        <div className={`${styles.pupil} ${v.pupil}`} />
                        <div className={styles.eyeShine} />
                    </div>
                    <div className={`${styles.eye} ${v.eye} ${isTalking ? styles.eyeActive : ""}`}>
                        <div className={`${styles.pupil} ${v.pupil}`} />
                        <div className={styles.eyeShine} />
                    </div>
                </div>

                {/* Cheeks */}
                <div className={`${styles.cheek} ${styles.cheekLeft} ${v.cheek}`} />
                <div className={`${styles.cheek} ${styles.cheekRight} ${v.cheek}`} />

                {/* Mouth */}
                <div className={`${styles.mouth} ${v.mouth} ${isTalking ? styles.mouthTalking : ""}`} />
            </div>

            {/* Tiny body */}
            <div className={`${styles.body} ${v.body}`}>
                {/* Arms */}
                <div className={`${styles.armLeft} ${v.arm} ${isTalking ? styles.armTalking : ""}`} />
                <div className={`${styles.armRight} ${v.arm} ${isTalking ? styles.armTalking : ""}`} />

                {/* Belly light */}
                <div className={`${styles.belly} ${v.belly} ${isTalking ? styles.bellyTalking : ""}`} />
            </div>

            {/* Tiny feet */}
            <div className={styles.feet}>
                <div className={`${styles.foot} ${v.foot}`} />
                <div className={`${styles.foot} ${v.foot}`} />
            </div>

            {/* Shadow */}
            <div className={styles.shadow} />
        </div>
    );
}
