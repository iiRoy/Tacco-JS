"use strict";

const input = require("fs").readFileSync("/dev/stdin", "utf8");
const rows = input.trim().split("\n");

const header = rows.shift().trim().split(" ").map(Number);
const N = header[0];
const A = header[1];
const B = header[2];
const C = header[3];

const queList = [];
queList.push({ A, B, C, result: [] });

let resultQue;
while (queList.length) {
  const que = queList.pop();
  if (que.result.length >= N) {
    resultQue = que;
    break;
  }

  const row = rows[que.result.length];
  if (que[row[0]] > 0) {
    const newQue = Object.create(que);
    newQue[row[0]] -= 1;
    newQue[row[1]] += 1;
    newQue.result = que.result.concat([row[1]]);
    queList.push(newQue);
  }
  if (que[row[1]] > 0) {
    const newQue = Object.create(que);
    newQue[row[0]] += 1;
    newQue[row[1]] -= 1;
    newQue.result = que.result.concat([row[1]]);
    queList.push(newQue);
  }
}

if (resultQue) {
  console.log("Yes");
  console.log(resultQue.result.join("\n"));
} else {
  console.log("No");
}
