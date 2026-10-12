const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let p = 0;

const n = input[p++];
const k = input[p++];

const graph = Array.from({ length: n }, () => []);

for (let i = 0; i < n - 1; i++) {
  const a = input[p++] - 1;
  const b = input[p++] - 1;
  graph[a].push(b);
  graph[b].push(a);
}

const mod = 1000000007;
const parent = Array(n).fill(-1);
const order = [0];
parent[0] = -2;

for (let i = 0; i < order.length; i++) {
  const v = order[i];

  for (const to of graph[v]) {
    if (parent[to] !== -1) continue;
    parent[to] = v;
    order.push(to);
  }
}

let answer = 1;

for (let i = 0; i < order.length; i++) {
  const v = order[i];
  const forbidden = v === 0 ? 0 : parent[v] === 0 ? 1 : 2;
  let available = k - forbidden;

  answer = (answer * available) % mod;

  let used = 0;

  for (const to of graph[v]) {
    if (parent[to] === v) {
      const choices = k - (v === 0 ? 1 : 2) - used;
      answer = (answer * choices) % mod;
      used++;
    }
  }
}

console.log(answer % mod);