import db from "@/config/database";

function getAll() {
  return (db as any).plugins.toArray();
}

function insert(data: { [key: string]: any }) {
  return (db as any).plugins.add(data);
}

function removeById(id: string) {
  return (db as any).plugins.delete(id);
}

export { getAll, insert, removeById };
