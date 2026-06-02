import { compareTwoFiles } from "./similarity.js";

const [,, fileA, fileB, rawMode = "1"] = process.argv;

if (!fileA || !fileB) {
  console.error("Usage: node Vectorization/compare.js <fileA> <fileB> [mode]");
  console.error("  mode: 1=type (default), 2=value, 3=type-value");
  process.exit(1);
}

const MODE_MAP = { "1": "type", "2": "value", "3": "type-value" };
const mode = MODE_MAP[rawMode];

if (!mode) {
  console.error(`Invalid mode: ${rawMode}. Use 1, 2, or 3.`);
  process.exit(1);
}

const result = compareTwoFiles(fileA, fileB, { mode });
console.log(JSON.stringify(result.vector));
