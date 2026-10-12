var fs = require("fs");

const getAbsDifference = function(pairValues) {
  return Math.abs(pairValues[0] - pairValues[1]);
};

const buildNextSequence = function(sequenceValues) {
  const reducedValues = [];

  for (let position = 0; position < sequenceValues.length - 1; position++) {
    const leftValue = sequenceValues[position];
    const rightValue = sequenceValues[position + 1];

    reducedValues.push(getAbsDifference([leftValue, rightValue]));
  }

  return reducedValues;
};

const runReductionProcess = function(rawInput) {
  const inputRows = rawInput.split("\n");

  const unusedLengthValue = inputRows[0];

  let currentSequence = inputRows[1].split("").map(function(characterDigit) {
    return characterDigit - 0;
  });

  let lastReduction = [];

  while (lastReduction.length !== 1) {
    lastReduction = buildNextSequence(currentSequence);
    currentSequence = Array.from(lastReduction);
  }

  console.log(lastReduction[0]);
};

runReductionProcess(fs.readFileSync("/dev/stdin", "utf8"));