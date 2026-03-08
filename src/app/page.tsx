import Image from "next/image";
import styles from "./page.module.css";

const agents = [
  {
    id: "analytical",
    name: "A.R.I.S.",
    role: "Logical processes, data analysis, and structural organization.",
    image: "/images/analytical.png",
    status: "Online",
    styleClass: styles.cardAnalytical,
  },
  {
    id: "creative",
    name: "N.O.V.A.",
    role: "Design, brainstorming, and visionary thinking.",
    image: "/images/creative.png",
    status: "Ready",
    styleClass: styles.cardCreative,
  },
  {
    id: "companion",
    name: "L.U.M.I.",
    role: "Empathetic interaction, emotional support, and friendly chatter.",
    image: "/images/companion.png",
    status: "Active",
    styleClass: styles.cardCompanion,
  },
];

export default function Home() {
  return (
    <>
      <div className={styles.bgGrid}></div>
      <main className={styles.container}>
        <h1 className={styles.title}>Choose Your AI Assistant</h1>

        <div className={styles.grid}>
          {agents.map((agent) => (
            <div key={agent.id} className={`${styles.card} ${agent.styleClass}`}>
              <div className={styles.imageWrapper}>
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={200}
                  height={200}
                  className={styles.image}
                  priority
                />
              </div>
              <h2 className={styles.name}>{agent.name}</h2>
              <p className={styles.role}>{agent.role}</p>
              <div className={styles.status}>{agent.status}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
