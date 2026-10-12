const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\n/);
const n = Number(input[0]);
const s = input[1].trim();

function expected(left, middle, sign) {
  const same = left === middle;
  return sign === "o" ? same : !same;
}

function valid(a, i) {
  const left = a[(i - 1 + n) % n];
  const right = a[(i + 1) % n];
  const saysTrue = expected(left, right, s[i]);
  return a[i] === "S" ? saysTrue : !saysTrue;
}

const starts = [
  ["S", "S"],
  ["S", "W"],
  ["W", "S"],
  ["W", "W"]
];

for (const st of starts) {
  const animal = Array(n);
  animal[0] = st[0];
  animal[1] = st[1];

  for (let i = 1; i < n - 1; i++) {
    const prev = animal[i - 1];
    const cur = animal[i];
    const saysSame = s[i] === "o";

    if ((cur === "S" && saysSame) || (cur === "W" && !saysSame)) {
      animal[i + 1] = prev;
    } else {
      animal[i + 1] = prev === "S" ? "W" : "S";
    }
  }

  let ok = true;

  for (let i = 0; i < n; i++) {
    if (!valid(animal, i)) {
      ok = false;
      break;
    }
  }

  if (ok) {
    console.log(animal.join(""));
    process.exit(0);
  }
}

console.log(-1);