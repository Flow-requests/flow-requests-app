import { Dexie } from "dexie";

const db = new Dexie("FlowRequests");
db.version(1).stores({
  workflows: "++id",
  plugins: "++id",
});

export default db;
