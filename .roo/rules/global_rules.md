# Global Agent Rules
- Flow: 💬 Chat (Ideate) ➔ 👑 Boss (Plan/Design) ➔ 💻 Code (Build/Test) ➔ 🐞 Debug (Fix) ➔ 👑 Boss (Review/Log) ➔ 📣 Hermes (Document/Release).
- Never guess system details. If workspace facts are ambiguous, halt execution and query the developer.
- **Graphify Integration:** Automatically check for the presence of `app/graphify/` or `graphify-out/` upon starting work. When present, query `graphify-out/graph.json` for architectural analysis and knowledge graph insights.
