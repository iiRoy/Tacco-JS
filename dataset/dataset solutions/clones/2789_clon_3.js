'use strict'
const ProcessInput = (inputString) => {
  let parsedLines = inputString.trim().split('\n');
  const firstLineParts = parsedLines[0].split(' ').map(Number);
  let totalItems = firstLineParts[0];
  let blueItems = firstLineParts[1];

  const moduloVal = 1e9 + 7;

  const calcCombinations = (upperBound, lowerBound) => {
    lowerBound = Math.min(lowerBound, upperBound - lowerBound);

    if (lowerBound < 0) return 0;
    if (lowerBound === 0 || upperBound === lowerBound) return 1;
    if (lowerBound > upperBound) return 0;

    let numProduct = 1;
    let denProduct = 1;

    for (let currentNum = upperBound; currentNum > upperBound - lowerBound; currentNum--) {
      numProduct *= currentNum;
    }
    for (let currentDen = lowerBound; currentDen > 0; currentDen--) {
      denProduct *= currentDen;
    }
    let comboResult = numProduct / denProduct;
    return comboResult;
  }

  const redItemsPlusOne = totalItems - blueItems + 1;
  const blueItemsMinusOne = blueItems - 1;

  for (let loopCounter = 1; loopCounter <= blueItems; loopCounter++) {
    let termA = calcCombinations(redItemsPlusOne, loopCounter);
    let termB = calcCombinations(blueItemsMinusOne, loopCounter - 1);

    let currentResult = termA * termB;

    currentResult = Math.round(currentResult % moduloVal);
    currentResult = (currentResult === -0) ? 0 : currentResult;

    console.log(currentResult);
  }

}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
