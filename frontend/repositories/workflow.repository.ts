import db from "@/config/database";

async function getAll() {
  const results = await (db as any).workflows.toArray();
  return results.map((item: { [key: string]: any }) => {
    const data = JSON.parse(item.data);
    return { id: item.id, name: data.name, data: JSON.parse(item.data) };
  });
}

async function findById(id: string) {
  const results = await (db as any).workflows.toArray();
  const data = results.find((item: any) => item.id == id);
  return data || null;
}

function update(id: string, data: { [key: string]: any }) {
  return (db as any).workflows.update(id, data);
}

function insert(data: { [key: string]: any }) {
  return (db as any).workflows.add(data);
}

function removeById(id: string) {
  return (db as any).workflows.delete(id);
}

export { getAll, insert, findById, update, removeById };
