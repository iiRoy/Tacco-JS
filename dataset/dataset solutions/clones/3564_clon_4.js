const fs = require("fs");

const k = Number(fs.readFileSync(0, "utf8").trim());

const evenCount = Math.floor(k / 2);
const oddCount = k - evenCount;

process.stdout.write(String(evenCount * oddCount));