'use strict'
function processInput(rawData) {
  const inputLines = rawData.split("\n");
  const firstLineContent = inputLines[0];
  const stringComponents = firstLineContent.split(" ");
  const numericValues = stringComponents.map(Number);

  const primaryValue = numericValues[0];
  const secondaryValue = numericValues[1];

  let calculatedResult;

  const greaterOfTwo = Math.max(primaryValue, secondaryValue);
  const isIdentical = (primaryValue === secondaryValue);
  const adjustmentFactor = isIdentical ? 0 : 1;

  calculatedResult = (greaterOfTwo * 2) - adjustmentFactor;

  console.log(calculatedResult);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
