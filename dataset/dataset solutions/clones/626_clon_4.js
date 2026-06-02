const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');

const rows = input.split('\n');
const n = rows[0] - 0;
const tape = [];

for (let pos = 0; pos < n; pos++) {
  const value = rows[pos + 1] - 0;
  tape[pos] = value;
  tape[pos + n] = value;
  tape[pos + n + n] = value;
}

const own = Object.prototype.hasOwnProperty;
const cache = new Map();

function indexOfSliceBound(x) {
  let v = Number(x);
  if (Number.isNaN(v)) {
    v = 0;
  } else if (v === Infinity) {
    v = tape.length;
  } else if (v === -Infinity) {
    v = 0;
  } else {
    v = v < 0 ? Math.ceil(v) : Math.floor(v);
  }

  if (v < 0) {
    v = Math.max(tape.length + v, 0);
  } else if (v > tape.length) {
    v = tape.length;
  }
  return v;
}

function blockSum(from, to) {
  const left = indexOfSliceBound(from);
  const right = indexOfSliceBound(to);
  if (right <= left) return 0;

  const key = left + ':' + right;
  if (cache.has(key)) return cache.get(key);

  let total = 0;
  for (let cursor = left; cursor < right; cursor++) {
    if (own.call(tape, cursor)) {
      total += tape[cursor];
    }
  }
  cache.set(key, total);
  return total;
}

function strongestTwoWayCut(from, to) {
  const left = indexOfSliceBound(from);
  const right = indexOfSliceBound(to);
  const width = right - left;
  if (width <= 1) return undefined;

  let best;
  for (let offset = 1; offset < width; offset++) {
    const score = Math.min(blockSum(left, left + offset), blockSum(left + offset, right));
    if (!Number.isNaN(score) && (best === undefined || score > best)) {
      best = score;
    }
  }
  return best;
}

const pieces = [];
const remainders = new Map();

for (let length = 1; length < n - 2; length++) {
  for (let start = 0; start < n; start++) {
    const restStart = start + length;
    const restEnd = start + n;
    const normalizedKey = indexOfSliceBound(restStart) + ':' + indexOfSliceBound(restEnd);

    pieces.push({
      amount: blockSum(start, start + length),
      interval: normalizedKey,
      restStart,
      restEnd,
    });

    if (!remainders.has(normalizedKey)) {
      remainders.set(normalizedKey, { restStart, restEnd, value: undefined, ready: false });
    }
  }
}

for (const item of remainders.values()) {
  item.value = strongestTwoWayCut(item.restStart, item.restEnd);
  item.ready = true;
}

let answer = 0;
for (const piece of pieces) {
  const limit = remainders.get(piece.interval).value;
  if (limit !== undefined && piece.amount <= limit) {
    answer = Math.max(answer, piece.amount);
  }
}

console.log(answer);
