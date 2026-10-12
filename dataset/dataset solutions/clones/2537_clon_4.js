const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let p = 0;

const n = data[p++];
const m = data[p++];

const graph = Array.from({ length: n + 1 }, () => []);

for (let i = 0; i < m; i++) {
  const from = data[p++];
  const to = data[p++];
  graph[from].push(to);
}

const state = Array(n + 1).fill(0);
const stack = [];
const index = Array(n + 1).fill(-1);
let answer = null;

function search(v) {
  state[v] = 1;
  index[v] = stack.length;
  stack.push(v);

  for (const to of graph[v]) {
    if (answer) return;

    if (state[to] === 0) {
      search(to);
    } else if (state[to] === 1) {
      answer = stack.slice(index[to]);
      return;
    }
  }

  stack.pop();
  index[v] = -1;
  state[v] = 2;
}

for (let i = 1; i <= n; i++) {
  if (state[i] === 0) {
    search(i);
  }
  if (answer) break;
}

if (!answer) {
  console.log(-1);
} else {
  console.log(answer.length + "\n" + answer.join("\n"));
}