import { Storage } from "@ionic/storage";

let storage: Storage | null = null;

async function getStorage(): Promise<Storage> {
  if (!storage) {
    storage = new Storage();
    await storage.create();
  }
  return storage;
}

export async function getAllItems<T = any>(): Promise<
  Record<string, T | null>
> {
  const st = await getStorage();
  const keys = await st.keys();
  const entries = await Promise.all(
    keys.map(
      async (key) =>
        [key, (await st.get(key)) as T | null] as [string, T | null]
    )
  );
  return Object.fromEntries(entries);
}

export async function setItem(key: string, value: any): Promise<void> {
  const st = await getStorage();
  await st.set(key, value);
}

export async function exists(key: string): Promise<boolean> {
  const st = await getStorage();
  const val = await st.get(key);
  return val !== null && val !== undefined;
}

export async function getItem<T = any>(key: string): Promise<T | null> {
  const st = await getStorage();
  return (await st.get(key)) as T | null;
}

export async function removeItem(key: string): Promise<void> {
  const st = await getStorage();
  await st.remove(key);
}

export async function clearAll(): Promise<void> {
  const st = await getStorage();
  await st.clear();
}

export async function keys(): Promise<string[]> {
  const st = await getStorage();
  return st.keys();
}
