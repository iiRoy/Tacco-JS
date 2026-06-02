"use strict";

const fs = require("fs");

const raw = fs.readFileSync("/dev/stdin", "utf8");
const first = raw.trim().split("\n")[0];
const seq = first.split("");
const n = seq.length;
const ans = Array(n).fill(0);

const rPrefix = Array(n + 1).fill(0);
const lPrefix = Array(n + 1).fill(0);
const changes = [];

for (let i = 0; i < n; i++) {
  rPrefix[i + 1] = rPrefix[i] + (seq[i] === "R" ? 1 : 0);
  lPrefix[i + 1] = lPrefix[i] + (seq[i] === "L" ? 1 : 0);
  if (i + 1 < n && seq[i] !== seq[i + 1]) {
    changes.push(i);
  }
}

const place = (pivot, rCount, lCount) => {
  const total = rCount + lCount;
  if (total % 2 === 0) {
    ans[pivot] = total / 2;
    ans[pivot + 1] = total / 2;
  } else if ((Math.max(rCount, lCount) - 1) % 2 === 0) {
    ans[pivot] = rCount;
    ans[pivot + 1] = lCount;
  } else {
    ans[pivot] = lCount;
    ans[pivot + 1] = rCount;
  }
};

let sectionStart = 0;
let rememberedPivot;
let index = 0;

while (index + 1 < changes.length) {
  rememberedPivot = changes[index];
  const closeAt = changes[index + 1];
  const rCount = rPrefix[closeAt + 1] - rPrefix[sectionStart];
  const lCount = lPrefix[closeAt + 1] - lPrefix[sectionStart];
  place(rememberedPivot, rCount, lCount);
  sectionStart = closeAt + 1;
  index += 2;
}

if (index < changes.length) {
  rememberedPivot = changes[index];
}

if (n >= 2) {
  const rTail = rPrefix[n - 1] - rPrefix[sectionStart];
  const lTail = lPrefix[n - 1] - lPrefix[sectionStart] + 1;
  place(rememberedPivot, rTail, lTail);
}

console.log(ans.join(" "));
