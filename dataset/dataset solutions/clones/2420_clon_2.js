"use strict";
function buildMultiDimArray (valueExpr) {
  const funcArgs = arguments;
  let argCount = funcArgs.length;
  let evalString = "Array(funcArgs[" + --argCount + "]).fill(0).map(_val=>{return " + valueExpr + ";})";
  while (--argCount) {
    evalString = "Array(funcArgs[" + argCount + "]).fill(0).map(_val=>" + evalString + ")";
  }
  return eval(evalString);
}

const inputHandler = require("readline").createInterface(process.stdin, process.stdout);
const mainSequence = (function* () {
  const readNextLine = () => inputHandler.once("line", lineData => mainSequence.next(lineData));

  let totalElements = yield readNextLine();
  totalElements = +totalElements;

  let primaryArray = [];
  for (let idxCounter = 1; idxCounter <= totalElements; idxCounter++) {
    primaryArray[idxCounter - 1] = idxCounter;
  }
  console.log("?", primaryArray.join(" "));
  let initialResult = yield readNextLine();

  let offsetValue = 1;
  while (true) {
    primaryArray[offsetValue - 1] = offsetValue + totalElements;
    console.log("?", primaryArray.join(" "));
    let currentResult = yield readNextLine();
    if (initialResult[0] !== currentResult[0]) break;
    offsetValue++;
  }

  let finalSolution = [];
  let secondaryArray = [];
  let trackedIndices = new Set();
  for (let loopIndex = 0; loopIndex < totalElements - 1; loopIndex++) {
    primaryArray[loopIndex] = (offsetValue + loopIndex - 1) % (2 * totalElements) + 1;
    secondaryArray[loopIndex] = (primaryArray[loopIndex] + totalElements - 1) % (2 * totalElements) + 1;
    trackedIndices.add(loopIndex + offsetValue);
  }
  for (let itemIndex = 1; itemIndex <= 2 * totalElements; itemIndex++) {
    if (trackedIndices.has(itemIndex)) {
      secondaryArray[totalElements - 1] = itemIndex;
      console.log("?", secondaryArray.join(" "));
      let queryResponse = yield readNextLine();
      if (queryResponse[0] === "R") {
        finalSolution[itemIndex - 1] = "R";
      } else {
        finalSolution[itemIndex - 1] = "B";
      }
    } else {
      primaryArray[totalElements - 1] = itemIndex;
      console.log("?", primaryArray.join(" "));
      let queryResponse = yield readNextLine();
      if (queryResponse[0] === "R") {
        finalSolution[itemIndex - 1] = "R";
      } else {
        finalSolution[itemIndex - 1] = "B";
      }
    }
  }
  console.log("!", finalSolution.join(""));
})();
mainSequence.next();