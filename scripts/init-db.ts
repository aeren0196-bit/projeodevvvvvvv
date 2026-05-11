import { execSync } from "child_process";
import path from "path";

const cwd = process.cwd();
const schemaPath = path.join(cwd, "src", "db", "schema.json");
const outputDir = path.join(cwd, "src", "db");
const dbPath = path.join(cwd, "public", "data", "database.db");

const cmd = `dbcli generate --schema "${schemaPath}" --database "${dbPath}" --output "${outputDir}"`;

try {
  console.log("Generating database with dbcli...");
  execSync(cmd, { stdio: "inherit" });
  console.log(`Database created: ${dbPath}`);
} catch (err) {
  console.error("Failed to generate database. Ensure dbcli is installed globally.");
  throw err;
}
