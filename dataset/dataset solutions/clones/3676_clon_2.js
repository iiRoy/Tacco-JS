const inputLines = ("" + require("fs").readFileSync(0)).split`
`;

let parsedDimension = inputLines[accumulator = 0];

const sequenceString = inputLines[1];

for (let bitmask = 1 << parsedDimension; bitmask--;) {
  let currentCombination = "";

  for (let bitPosition = parsedDimension; bitPosition--;) {
    currentCombination = (bitmask & (1 << bitPosition))
      ? sequenceString[bitPosition] + currentCombination
      : currentCombination + sequenceString[bitPosition];
  }

  inputLines[currentCombination] = (Number(inputLines[currentCombination]) || 0) + 1;
}

for (let bitmask = 1 << parsedDimension; bitmask--;) {
  let currentCombination = "";

  for (let bitPosition = parsedDimension; bitPosition--;) {
    currentCombination = (bitmask & (1 << bitPosition))
      ? sequenceString[2 * parsedDimension + (~bitPosition)] + currentCombination
      : currentCombination + sequenceString[2 * parsedDimension + (~bitPosition)];
  }

  accumulator += (Number(inputLines[currentCombination]) || 0);
}

console.log(accumulator);