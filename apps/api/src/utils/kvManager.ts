import type Env from "@/types/env";

const kvManager = (kv: Env["KV"]) => ({
get: async (key: string) => {
            const value = await kv.get(key);
            return value;
        },
set: async (key: string, value: string) => {
            await kv.put(key, value);
        },
delete: async (key: string) => {
            await kv.delete(key);
        },
list: async () => {
            const keys = await kv.list();
            return keys;
        }
});

export default kvManager;