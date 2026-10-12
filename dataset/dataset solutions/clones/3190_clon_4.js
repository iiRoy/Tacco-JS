const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const count = data[0];
const values = data.slice(1, count + 1);

values.sort((x, y) => x - y);

function divisor(a, b) {
  while (b !== 0) {
    const r = a - Math.floor(a / b) * b;
    a = b;
    b = r;
  }
  return a;
}

let answer = Infinity;
let previous = values.shift();

while (values.length > 0) {
  const current = values.shift();
  const g = divisor(previous, current);

  if (g < answer) {
    answer = g;
  }

  previous = current;
}

process.stdout.write(String(answer));