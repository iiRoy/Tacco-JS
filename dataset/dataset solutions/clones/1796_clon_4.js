const fs = require("fs");

const tokens = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let pointer = 0;

const size = tokens[pointer++];
let remaining = tokens[pointer++];
let current = tokens.slice(pointer, pointer + size);

function nextGeneration(state) {
  const events = Array(size + 1).fill(0);

  state.forEach((reach, index) => {
    const from = index - reach < 0 ? 0 : index - reach;
    const to = index + reach + 1 > size ? size : index + reach + 1;
    events[from] += 1;
    events[to] -= 1;
  });

  let active = 0;
  let complete = true;

  const updated = Array.from({ length: size }, (_, index) => {
    active += events[index];
    if (active !== size) complete = false;
    return active;
  });

  return [updated, complete];
}

while (remaining > 0) {
  const result = nextGeneration(current);
  current = result[0];
  remaining--;

  if (result[1]) {
    break;
  }
}

process.stdout.write(current.join(" "));