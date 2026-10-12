const fs = require("fs");

const values = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const distance = values[2] - values[1] - 1;

process.stdout.write(distance & 1 ? "Alice" : "borys");