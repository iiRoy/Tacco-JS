'use strict';
const outputWriter = (message) => console.log(message);

function processInputData(sourceData) {
  const dataLines = sourceData.split("\n");
  const numericString = dataLines[0].split(" ")[0];

  const hasTargetDigit = numericString.includes('7');

  outputWriter(hasTargetDigit ? 'Yes' : 'No');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
