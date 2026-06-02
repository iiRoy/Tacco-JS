const sequenceCache = [1, 1, 2];

function obtainSequenceValue(indexPosition) {
  if (indexPosition < sequenceCache.length) {
    return sequenceCache[indexPosition];
  }

  for (let currentIdx = sequenceCache.length; currentIdx <= indexPosition; currentIdx++) {
    sequenceCache[currentIdx] = sequenceCache[currentIdx - 1] + sequenceCache[currentIdx - 2] + sequenceCache[currentIdx - 3];
  }
  return sequenceCache[indexPosition];
}

function computeDuration(inputNumber) {
  const sequenceResult = obtainSequenceValue(inputNumber);
  const divisor = 3650;
  return Math.ceil(sequenceResult / divisor);
}

const fileContents = require("fs").readFileSync("/dev/stdin", "utf-8");
const dataLines = fileContents.split("\n");

for (const currentLine of dataLines) {
  const parsedNumber = Number(currentLine);
  if (parsedNumber === 0) {
    continue;
  }
  console.log(computeDuration(parsedNumber));
}
