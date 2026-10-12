function readInput() { return require("fs").readFileSync("/dev/stdin", "utf8").trim(); }
function printOutput(value) { console.log(value); }

const inputTransformers = {
  0: (data) => data,
  1: (data) => Number.parseInt(data),
  2: (data) => data.split(" "),
  3: (data) => data.split("\n"),
  4: (data) => data.split(" ").map(Number),
  5: (data) => data.split("\n").map(Number),
  6: (data) => data.split(""),
  7: (data) => data.split("").map(Number),
};

function processInput(source, transformationType) {
  return inputTransformers[transformationType](source);
}

function calculateAndDisplay(rawInput) {
  const lines = processInput(rawInput, 3);
  const elementCount = processInput(lines[0], 1);
  const numberSequence = processInput(lines[1], 4);

  const { cumulativeSum, sumOfSquares } = numberSequence.reduce(
    (accumulator, currentValue) => ({
      cumulativeSum: accumulator.cumulativeSum + currentValue,
      sumOfSquares: accumulator.sumOfSquares + currentValue * currentValue,
    }),
    { cumulativeSum: 0, sumOfSquares: 0 }
  );

  const pairProductSum = (cumulativeSum * cumulativeSum - sumOfSquares) / 2;

  printOutput(pairProductSum);
}

calculateAndDisplay(readInput());
