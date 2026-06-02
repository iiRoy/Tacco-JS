"use strict";

const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf8");
const tokens = input.split(/ |\n/);
let pos = 0;

function takeNumbers(count) {
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = +tokens[pos++];
  return out;
}

function takeString() {
  return tokens[pos++];
}

const answer = solve();
if (answer !== undefined) console.log(String(answer));

function solidLine(length) {
  return new Array(length).fill("@").join("");
}

function solve() {
  const INF = 1e9;
  const [h, w, k] = takeNumbers(3);
  const [sy, sx, gy, gx] = takeNumbers(4);

  const field = new Array(h + 2);
  field[0] = solidLine(w + 2);
  for (let r = 1; r <= h; r++) {
    field[r] = "@" + takeString() + "@";
  }
  field[h + 1] = solidLine(w + 2);

  const leftWall = Array.from({ length: h + 2 }, () => new Array(w + 2));
  const rightWall = Array.from({ length: h + 2 }, () => new Array(w + 2));
  const upWall = Array.from({ length: h + 2 }, () => new Array(w + 2));
  const downWall = Array.from({ length: h + 2 }, () => new Array(w + 2));

  for (let y = 0; y <= h + 1; y++) {
    let last = -1;
    for (let x = 0; x <= w + 1; x++) {
      leftWall[y][x] = last;
      if (field[y][x] === "@") last = x;
    }
    last = w + 2;
    for (let x = w + 1; x >= 0; x--) {
      rightWall[y][x] = last;
      if (field[y][x] === "@") last = x;
    }
  }

  for (let x = 0; x <= w + 1; x++) {
    let last = -1;
    for (let y = 0; y <= h + 1; y++) {
      upWall[y][x] = last;
      if (field[y][x] === "@") last = y;
    }
    last = h + 2;
    for (let y = h + 1; y >= 0; y--) {
      downWall[y][x] = last;
      if (field[y][x] === "@") last = y;
    }
  }

  const dist = Array.from({ length: h + 2 }, () => Array(w + 2).fill(INF));
  const rowUnused = Array.from({ length: h + 2 }, () => new Set());
  const colUnused = Array.from({ length: w + 2 }, () => new Set());

  for (let y = 1; y <= h; y++) {
    for (let x = 1; x <= w; x++) {
      if (field[y][x] !== "@") {
        rowUnused[y].add(x);
        colUnused[x].add(y);
      }
    }
  }

  dist[sy][sx] = 0;
  rowUnused[sy]?.delete(sx);
  colUnused[sx]?.delete(sy);

  const qy = [sy];
  const qx = [sx];
  let head = 0;

  while (head < qy.length) {
    const y = qy[head];
    const x = qx[head++];
    const nd = dist[y][x] + 1;

    const xl = Math.max(x - k, leftWall[y][x] + 1);
    const xr = Math.min(x + k, rightWall[y][x] - 1);
    const horizontal = [];
    for (const nx of rowUnused[y] || []) {
      if (nx >= xl && nx <= xr) horizontal.push(nx);
    }
    for (const nx of horizontal) {
      rowUnused[y].delete(nx);
      colUnused[nx].delete(y);
      dist[y][nx] = nd;
      qy.push(y);
      qx.push(nx);
    }

    const yu = Math.max(y - k, upWall[y][x] + 1);
    const yd = Math.min(y + k, downWall[y][x] - 1);
    const vertical = [];
    for (const ny of colUnused[x] || []) {
      if (ny >= yu && ny <= yd) vertical.push(ny);
    }
    for (const ny of vertical) {
      colUnused[x].delete(ny);
      rowUnused[ny].delete(x);
      dist[ny][x] = nd;
      qy.push(ny);
      qx.push(x);
    }
  }

  return dist[gy][gx] === INF ? -1 : dist[gy][gx];
}
