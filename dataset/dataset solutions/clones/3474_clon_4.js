const fs = require("fs");

const raw = fs.readFileSync(0, "utf8").split(/\n/);
const n = Number(raw[0]);

let pool = [];
for (let i = 1; i <= n; i++) {
  pool.push(Number(raw[i]));
}

pool = pool.map(String).sort().map(Number);

let low = 0;
let high = pool.length - 1;
let front = [];
let back = [];
let mode = 0;

function size() {
  return front.length + back.length;
}

function first() {
  return front.length ? front[front.length - 1] : back[0];
}

function last() {
  return back.length ? back[back.length - 1] : front[0];
}

function addLeft(v) {
  front.push(v);
}

function addRight(v) {
  back.push(v);
}

while (size() < n) {
  if (mode === 0) {
    const v = pool[low++];

    if (size() === 0) {
      addRight(v);
    } else if (Math.abs(first() - v) > Math.abs(last() - v)) {
      addLeft(v);
      if (size() < n) addRight(pool[low++]);
    } else {
      addRight(v);
      if (size() < n) addLeft(pool[low++]);
    }

    mode = 1;
  } else {
    const v = pool[high--];

    if (Math.abs(first() - v) > Math.abs(last() - v)) {
      addLeft(v);
      if (size() < n) addRight(pool[high--]);
    } else {
      addRight(v);
      if (size() < n) addLeft(pool[high--]);
    }

    mode = 0;
  }
}

const arranged = front.reverse().concat(back);
let answer = 0;

for (let i = 1; i < arranged.length; i++) {
  answer += Math.abs(arranged[i - 1] - arranged[i]);
}

console.log(answer);