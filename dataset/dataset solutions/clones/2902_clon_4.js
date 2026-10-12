const fs = require("fs");

const values = fs.readFileSync(0, "utf8").trim().match(/\d+/g).map(Number);

let pieces = 0;

for (let i = 0; i < values[0]; i++) {
  pieces += 3;
}

pieces += values[1];

process.stdout.write(String(pieces >> 1));