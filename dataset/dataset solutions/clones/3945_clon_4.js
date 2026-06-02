"use strict";

const USE_SAMPLE = false;
const inputText = USE_SAMPLE
  ? "2\n1 19"
  : require("fs").readFileSync("/dev/stdin", "utf8").trim();

function solve(data) {
  const rows = data.split("\n");
  const amount = parseInt(rows[0]);
  const points = [0].concat(rows[1].split(" ").map(x => parseInt(x)), [0]);

  const fromStart = new Array(points.length);
  fromStart[0] = 0;
  for (let p = 1; p < points.length; p++) {
    fromStart[p] = fromStart[p - 1] + Math.abs(points[p] - points[p - 1]);
  }

  const toEnd = new Array(points.length);
  toEnd[points.length - 1] = 0;
  for (let p = points.length - 2; p >= 0; p--) {
    toEnd[p] = toEnd[p + 1] + Math.abs(points[p + 1] - points[p]);
  }

  const answers = [];
  let remove = 1;
  while (remove <= amount) {
    const leftCost = fromStart[remove - 1];
    const bridgeCost = Math.abs(points[remove + 1] - points[remove - 1]);
    const rightCost = toEnd[remove + 1];
    answers.push(String(leftCost + bridgeCost + rightCost));
    remove++;
  }

  console.log(answers.join("\n"));
}

solve(inputText);
