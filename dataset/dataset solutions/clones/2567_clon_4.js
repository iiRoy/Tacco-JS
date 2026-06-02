const fs = require('fs');

const sourceText = fs.readFileSync(0, 'utf8');
const rows = sourceText.length === 0 ? [] : sourceText.split(/\r?\n/);
if (rows.length > 0 && /\n$/.test(sourceText)) rows.pop();

let cursor = 0;
function takeLine() {
  if (cursor < rows.length) return rows[cursor++];
  throw "ArrayIndexOutOfBoundsException ‚There is no more input";
}
function asInt(value) {
  return parseInt(value);
}
function asChars(value) {
  return value.split("");
}
function emit(value) {
  console.log(value);
}
function debug(value) {
  console.error("debug:" + require("util").inspect(value, false, null));
}

function longestByIndependentScan(chars) {
  let best = 0;
  const total = chars.length;

  for (let anchor = 0; anchor < total; anchor++) {
    const border = anchor + Math.ceil((total - anchor) / 2);

    for (let mate = total - 1; mate >= border; mate--) {
      let same = 0;
      while (mate + same < total && chars[anchor + same] == chars[mate + same]) {
        same++;
      }
      if (same > best) best = same;
    }
  }

  return best;
}

function main() {
  const unusedCount = asInt(takeLine());
  const sequence = asChars(takeLine());
  emit(longestByIndependentScan(sequence));
}

console.error("\n");
const startedAt = Date.now();
main();
const elapsed = Date.now() - startedAt;
debug("time : " + elapsed + "ms");
debug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
