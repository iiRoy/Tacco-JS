'use strict';

function ProcessInput(rawData) {
  const parseNumericValue = (str) => parseInt(str, 10);

  let dataLines = rawData.split("\n");

  let numItems = parseNumericValue(dataLines[0]);
  let initialCount = parseNumericValue(dataLines[1]);
  let fixedRate = parseNumericValue(dataLines[2]);
  let additionalRate = parseNumericValue(dataLines[3]);

  let finalOutputValue;

  if (numItems <= fixedRate) {
    finalOutputValue = numItems * fixedRate;
  } else {
    let baseCharge = initialCount * fixedRate;
    let excessItems = numItems - initialCount;
    let excessCharge = excessItems * additionalRate;
    finalOutputValue = baseCharge + excessCharge;
  }

  console.log(finalOutputValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
