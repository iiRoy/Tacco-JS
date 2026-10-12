'use strict';

const parseNumericalParameters = (rawInputContent) => {
  const [firstDataLine] = rawInputContent.split('\n');
  const [valN, valA, valB] = firstDataLine.split(' ').map(Number);
  return { n: valN, a: valA, b: valB };
};

const calculateMinimumMoves = (parameters) => {
  const { n, a, b } = parameters;
  const differenceParity = (b - a) % 2;

  const strategyMap = new Map([
    [0, () => (b - a) / 2],
    [1, () => Math.min(b - 1, n - a)]
  ]);

  const selectedCalculation = strategyMap.get(differenceParity);
  return selectedCalculation();
};

const programEntry = (fullInputString) => {
  const processedParameters = parseNumericalParameters(fullInputString);
  const finalOutcome = calculateMinimumMoves(processedParameters);
  console.log(finalOutcome);
};

programEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
