const fs = require("fs");

const values = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

let total = 1;
const base = values.shift() + 1;

while (values.length > 0) {
  total *= base - values.shift();
}

process.stdout.write(String(total));