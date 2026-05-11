export { AppDbProvider } from "./provider";

import { parseJSONSchema } from "@promakeai/orm";
import schemaJson from "./schema.json";
export const schema = parseJSONSchema(schemaJson as any);

export {
  useDb,
  useAdapter,
  useDbLang,
  useDbList,
  useDbGet,
  useDbCreate,
  useDbUpdate,
  useDbDelete,
  SqliteAdapter,
} from "@promakeai/dbreact";

export { RestAdapter, parseJSONSchema } from "@promakeai/orm";

export * from "./types";
