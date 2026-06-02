"use strict";

const fs = require("fs");
const raw = fs.readFileSync("/dev/stdin", "utf8");
const tokens = raw.split(/ |\n/);
let cursor = 0;
const readNumber = () => +tokens[cursor++];

const INF = 1e9;

function matrix(rows, cols, fill) {
  const outer = new Array(rows);
  for (let i = 0; i < rows; i++) {
    const inner = new Array(cols);
    for (let j = 0; j < cols; j++) inner[j] = fill;
    outer[i] = inner;
  }
  return outer;
}

function listArray(size) {
  const a = new Array(size);
  for (let i = 0; i < size; i++) a[i] = [];
  return a;
}

class Components {
  constructor(n) {
    this.box = new Array(n + 1).fill(-1);
  }
  leader(v) {
    let r = v;
    while (this.box[r] >= 0) r = this.box[r];
    while (v !== r) {
      const p = this.box[v];
      this.box[v] = r;
      v = p;
    }
    return r;
  }
  join(a, b) {
    a = this.leader(a);
    b = this.leader(b);
    if (a === b) return false;
    if (this.box[b] <= this.box[a]) {
      this.box[b] += this.box[a];
      this.box[a] = b;
    } else {
      this.box[a] += this.box[b];
      this.box[b] = a;
    }
    return true;
  }
  amount(v) {
    return -this.box[this.leader(v)];
  }
}

const V = readNumber();
const E = readNumber();
const direct = matrix(V, V, INF);
const dist = matrix(V, V, INF);
const neighborOrder = listArray(V);

for (let i = 0; i < V; i++) dist[i][i] = 0;

for (let i = 0; i < E; i++) {
  const a = readNumber() - 1;
  const b = readNumber() - 1;
  const w = readNumber();
  direct[a][b] = w;
  direct[b][a] = w;
  dist[a][b] = w;
  dist[b][a] = w;
  neighborOrder[a].push(b);
  neighborOrder[b].push(a);
}

const tmax = readNumber();
const tmax2 = tmax * tmax;

let travelLeft = 0;
let position = 0;
let day = 0;
let consumedDay = -1;
let score = 0;
let route = [];

const answers = new Array(tmax);
const holding = new Set();
const orderedAt = listArray(V);

function closeDistancesByRelaxation() {
  const arcs = [];
  for (let i = 0; i < V; i++) {
    for (let j = 0; j < V; j++) {
      if (dist[i][j] < INF) arcs.push([i, j, dist[i][j]]);
    }
  }
  for (let source = 0; source < V; source++) {
    const row = dist[source].slice();
    for (let pass = 0; pass < V; pass++) {
      let changed = false;
      for (let k = 0; k < arcs.length; k++) {
        const edge = arcs[k];
        const via = row[edge[0]] + edge[2];
        if (via < row[edge[1]]) {
          row[edge[1]] = via;
          changed = true;
        }
      }
      if (!changed) break;
    }
    dist[source] = row;
  }
}

function stableTree(points) {
  const vertices = Array.from(points);
  vertices.push(0);
  const candidates = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      candidates.push([vertices[i], vertices[j], dist[vertices[i]][vertices[j]], candidates.length]);
    }
  }
  candidates.sort((a, b) => a[2] - b[2] || a[3] - b[3]);

  const groups = new Components(V);
  const chosen = [];
  for (let i = 0; groups.amount(0) !== vertices.length; i++) {
    const e = candidates[i];
    if (groups.join(e[0], e[1])) chosen.push([e[0], e[1], e[2]]);
  }
  return chosen;
}

function rebuildRouteFromTree(edges) {
  const roads = listArray(V);
  for (let i = 0; i < edges.length; i++) {
    const a = edges[i][0];
    const b = edges[i][1];
    roads[a].push(b);
    roads[b].push(a);
  }

  const walk = [];
  const stack = [{ node: 0, parent: -1, next: 0, opened: false }];
  while (stack.length) {
    const top = stack[stack.length - 1];
    if (!top.opened) {
      walk.push(top.node);
      top.opened = true;
    }
    if (top.next >= roads[top.node].length) {
      stack.pop();
      continue;
    }
    const to = roads[top.node][top.next++];
    if (to !== top.parent) stack.push({ node: to, parent: top.node, next: 0, opened: false });
  }

  route = walk.reverse();
  route.pop();
}

function readOrdersUpToToday() {
  route = [];
  while (consumedDay < day) {
    consumedDay++;
    const count = readNumber();
    for (let i = 0; i < count; i++) {
      readNumber();
      const destination = readNumber() - 1;
      holding.add(destination);
      orderedAt[destination].push(consumedDay);
    }
  }
  if (holding.size === 0) return;
  rebuildRouteFromTree(stableTree(holding));
}

function finishAtCurrentVertex() {
  holding.delete(position);
  while (orderedAt[position].length) {
    const wait = day - orderedAt[position].pop();
    score += tmax2 - wait * wait;
  }
}

function stepToward(goal) {
  const choices = neighborOrder[position];
  for (let i = 0; i < choices.length; i++) {
    const nxt = choices[i];
    if (dist[position][goal] === direct[position][nxt] + dist[nxt][goal]) {
      travelLeft = direct[position][nxt] - 1;
      position = nxt;
      return position;
    }
  }
  return -2;
}

function chooseMove() {
  if (holding.size === 0) {
    if (position === 0) return -2;
    return stepToward(0);
  }
  if (position === route[route.length - 1]) route.pop();
  if (route.length === 0) return stepToward(0);
  return stepToward(route[route.length - 1]);
}

function oneDay() {
  if (travelLeft) {
    travelLeft--;
    return position;
  }
  if (position === 0) readOrdersUpToToday();
  else finishAtCurrentVertex();
  return chooseMove();
}

function run() {
  closeDistancesByRelaxation();
  while (day < tmax) {
    answers[day] = oneDay() + 1;
    if (travelLeft < 0) {
      console.log(day, travelLeft, position);
      return;
    }
    day++;
  }
  return answers.join("\n");
}

const output = run();
try {
  fs.writeFileSync("/dev/stdout", output);
  console.log(score);
} catch (err) {
  console.log(output);
}
