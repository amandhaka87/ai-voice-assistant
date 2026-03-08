import styles from "./page.module.css";
import Robot from "./components/Robot";
import IdleChat from "./components/IdleChat";

const agents = [
  {
    id: "openai",
    name: "OpenAI",
    role: "Advanced reasoning, code generation, and creative writing.",
    status: "Online",
    variant: "openai" as const,
    styleClass: styles.cardOpenai,
  },
  {
    id: "gemini",
    name: "Gemini",
    role: "Multimodal intelligence, search integration, and deep analysis.",
    status: "Ready",
    variant: "gemini" as const,
    styleClass: styles.cardGemini,
  },
  {
    id: "claude",
    name: "Claude",
    role: "Thoughtful conversation, safety-first design, and detailed research.",
    status: "Active",
    variant: "claude" as const,
    styleClass: styles.cardClaude,
  },
];

export default function Home() {
  return (
    <>
      <div className={styles.bgGrid}></div>
      <main className={styles.container}>
        <h1 className={styles.title}>Choose Your AI Assistant</h1>

        <div className={styles.gridWrapper}>
          <IdleChat />
          <div className={styles.grid}>
            {agents.map((agent) => (
              <div key={agent.id} className={`${styles.card} ${agent.styleClass}`}>
                <div className={styles.robotWrapper}>
                  <Robot variant={agent.variant} />
                </div>
                <h2 className={styles.name}>{agent.name}</h2>
                <p className={styles.role}>{agent.role}</p>
                <div className={styles.status}>{agent.status}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
