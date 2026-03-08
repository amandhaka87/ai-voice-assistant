import styles from "./Robot.module.css";

type RobotVariant = "openai" | "gemini" | "claude";

interface RobotProps {
    variant: RobotVariant;
}

const variantMap = {
    openai: {
        head: styles.headOpenai,
        eye: styles.eyeOpenai,
        antennaTip: styles.antennaTipOpenai,
        body: styles.bodyOpenai,
        chestLight: styles.chestLightOpenai,
        bar: styles.barOpenai,
        arm: styles.armOpenai,
        leg: styles.legOpenai,
    },
    gemini: {
        head: styles.headGemini,
        eye: styles.eyeGemini,
        antennaTip: styles.antennaTipGemini,
        body: styles.bodyGemini,
        chestLight: styles.chestLightGemini,
        bar: styles.barGemini,
        arm: styles.armGemini,
        leg: styles.legGemini,
    },
    claude: {
        head: styles.headClaude,
        eye: styles.eyeClaude,
        antennaTip: styles.antennaTipClaude,
        body: styles.bodyClaude,
        chestLight: styles.chestLightClaude,
        bar: styles.barClaude,
        arm: styles.armClaude,
        leg: styles.legClaude,
    },
};

export default function Robot({ variant }: RobotProps) {
    const v = variantMap[variant];

    return (
        <div className={styles.robot}>
            {/* Head */}
            <div className={`${styles.head} ${v.head}`}>
                {/* Antenna */}
                <div className={styles.antenna}>
                    <div className={`${styles.antennaTip} ${v.antennaTip}`} />
                </div>
                {/* Eyes */}
                <div className={`${styles.eye} ${v.eye}`} />
                <div className={`${styles.eye} ${v.eye}`} />
            </div>

            {/* Neck */}
            <div className={styles.neck} />

            {/* Body */}
            <div className={`${styles.body} ${v.body}`}>
                {/* Arms */}
                <div className={`${styles.armLeft} ${v.arm}`} />
                <div className={`${styles.armRight} ${v.arm}`} />

                {/* Chest Light */}
                <div className={`${styles.chestLight} ${v.chestLight}`} />

                {/* LED Bars */}
                <div className={styles.chestBars}>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`${styles.chestBar} ${v.bar}`} />
                    ))}
                </div>
            </div>

            {/* Legs */}
            <div className={styles.legs}>
                <div className={`${styles.leg} ${v.leg}`} />
                <div className={`${styles.leg} ${v.leg}`} />
            </div>

            {/* Shadow */}
            <div className={styles.shadow} />
        </div>
    );
}
