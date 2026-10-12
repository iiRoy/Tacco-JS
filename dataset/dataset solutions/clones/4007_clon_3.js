const fs = require("fs");

function extractSecondRow(source) {
  const rows = source.trim().split(/\r?\n/);

  if (rows.length < 2) {
    return [];
  }

  return rows[1].trim().split(/\s+/);
}

function containsAffirmativeValue(values) {
  let position = 0;
  let found = false;

  while (position < values.length && !found) {
    const currentValue = values[position];

    if (currentValue === "Y") {
      found = true;
    }

    position += 1;
  }

  return found;
}

function determineOutput(source) {
  const values = extractSecondRow(source);
  const containsY = containsAffirmativeValue(values);

  return containsY ? "Four" : "Three";
}

const source = fs.readFileSync("/dev/stdin", "utf8");
const output = determineOutput(source);

console.log(output);