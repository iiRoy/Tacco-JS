'use strict';
function acquireSourceData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}
function displayResult(finalValue) {
  console.log(finalValue);
}

const inputTransformers = new Map([
  [0, (val) => val],
  [1, (val) => Number.parseInt(val)],
  [2, (val) => val.split(" ")],
  [3, (val) => val.split("\n")],
  [4, (val) => val.split(" ").map(Number)],
  [5, (val) => val.split("\n").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)]
]);

function applyInputTransformation(rawData, strategyKey) {
  const transformer = inputTransformers.get(strategyKey);
  return transformer ? transformer(rawData) : rawData;
}

function processDataset(rawInputString) {
  const dataLines = applyInputTransformation(rawInputString, 3).slice(1);

  const accumulatedSum = dataLines.reduce((currentSum, lineEntry) => {
    const [firstValStr, secondValStr] = lineEntry.split(" ");
    const firstNumeric = Number(firstValStr);
    const secondNumeric = Number(secondValStr);

    return currentSum + (firstNumeric < secondNumeric ? secondNumeric : 0);
  }, 0);

  displayResult(accumulatedSum);
}

processDataset(acquireSourceData());
