const fs = require("fs");

const [s, rawT] = fs.readFileSync(0, "utf8").trim().split(/\s+/);

function primitiveInfo(str) {
  for (let len = 1; len <= str.length; len++) {
    if (str.length % len !== 0) continue;

    const unit = str.slice(0, len);
    let ok = true;

    for (let i = 0; i < str.length; i += len) {
      if (str.slice(i, i + len) !== unit) {
        ok = false;
        break;
      }
    }

    if (ok) {
      return [unit, str.length / len];
    }
  }

  return [str, 1];
}

const info = primitiveInfo(rawT);
const piece = info[0];
const ratio = info[1];

const doubled = s.repeat(2);
const tripled = s.repeat(3);
const step = piece.length;

let best = 0;
let run = 0;
let cursor = doubled.indexOf(piece);

if (cursor < 0) {
  process.stdout.write("0");
} else {
  cursor += step;

  while (cursor < doubled.length) {
    const found = doubled.indexOf(piece, cursor);

    if (found < 0) {
      break;
    }

    if (found === cursor) {
      run++;
    } else {
      if (run > best) best = run;
      run = 1;
    }

    cursor = found + step;
  }

  if (run > best) best = run;

  const extended = tripled.indexOf(piece, cursor);
  if (extended === cursor) {
    run++;
    if (run > best) {
      process.stdout.write("-1");
      process.exit(0);
    }
  }

  process.stdout.write(String((best / ratio) | 0));
}