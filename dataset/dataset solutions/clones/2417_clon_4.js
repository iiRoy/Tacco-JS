"use strict";
const readlineInterface = require("readline").createInterface(process.stdin, process.stdout);

const mainLogic = (function* () {
  const retrieveLine = () => readlineInterface.once("line", (inputString) => mainLogic.next(inputString));

  const inputSize = Number(yield retrieveLine());

  const initialQueryArr = Array.from({ length: inputSize }, (_, idx) => idx + 1);
  console.log("?", initialQueryArr.join(" "));
  const firstQueryResponseChar = (yield retrieveLine())[0];

  let pivotIndex;
  for (let currentProbe = 1; ; currentProbe++) {
    const modifiedQueryArr = [...initialQueryArr];
    modifiedQueryArr[currentProbe - 1] = currentProbe + inputSize;
    console.log("?", modifiedQueryArr.join(" "));
    const currentQueryResponseChar = (yield retrieveLine())[0];
    if (firstQueryResponseChar !== currentQueryResponseChar) {
      pivotIndex = currentProbe;
      break;
    }
  }

  const primarySegment = Array.from({ length: inputSize - 1 }, (_, idx) => (pivotIndex + idx) % (2 * inputSize) + 1);
  const secondarySegment = primarySegment.map((val) => (val + inputSize) % (2 * inputSize) + 1);
  const primarySegmentValues = new Set(primarySegment);

  const finalResultSequence = [];
  const allPossibleValues = Array.from({ length: 2 * inputSize }, (_, idx) => idx + 1);

  for (const currentValue of allPossibleValues) {
    const queryConstruction = primarySegmentValues.has(currentValue)
      ? [...secondarySegment]
      : [...primarySegment];
    queryConstruction[inputSize - 1] = currentValue;

    console.log("?", queryConstruction.join(" "));
    const responseChar = (yield retrieveLine())[0];
    finalResultSequence[currentValue - 1] = responseChar === "R" ? "R" : "B";
  }

  console.log("!", finalResultSequence.join(""));
})();

mainLogic.next();
