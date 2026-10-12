const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let ptr = 0;

const n = data[ptr++];
const g = Array.from({ length: n }, () => []);

for (let i = 0; i < n - 1; i++) {
  const a = data[ptr++] - 1;
  const b = data[ptr++] - 1;
  const w = data[ptr++];

  g[a].push([b, w & 1]);
  g[b].push([a, w & 1]);
}

const color = Array(n).fill(-1);
const stack = [0];
color[0] = 0;

while (stack.length > 0) {
  const v = stack.pop();

  for (const edge of g[v]) {
    const to = edge[0];
    const parity = edge[1];

    if (color[to] !== -1) {
      continue;
    }

    color[to] = color[v] ^ parity;
    stack.push(to);
  }
}

console.log(color.join("\n"));