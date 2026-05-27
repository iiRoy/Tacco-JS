"use strict";

const inputReader = require("readline").createInterface(process.stdin, process.stdout);

const mainLogicGenerator = (function* () {
  const readNextLine = () => inputReader.once("line", (lineContent) => mainLogicGenerator.next(lineContent));

  let numElementsRaw = yield readNextLine();
  const numElements = +numElementsRaw;

  const currentPermutation = [];
  for (let idx = 1; idx <= numElements; idx++) {
    currentPermutation[idx - 1] = idx;
  }
  console.log("?", currentPermutation.join(" "));

  const initialResponse = yield readNextLine();
  let pivotIndex = 1;

  while (true) {
    currentPermutation[pivotIndex - 1] = pivotIndex + numElements;
    console.log("?", currentPermutation.join(" "));
    const currentResponse = yield readNextLine();
    if (initialResponse[0] !== currentResponse[0]) {
      break;
    }
    pivotIndex++;
  }

  const finalResult = [];
  const modifiedPermutation = [];
  const pivotIndicesSet = new Set();
  const lastElementIndex = numElements - 1;
  const totalRange = 2 * numElements;

  for (let idx = 0; idx < lastElementIndex; idx++) {
    currentPermutation[idx] = pivotIndex + idx;
    modifiedPermutation[idx] = (currentPermutation[idx] + numElements) % totalRange;
    pivotIndicesSet.add(idx + pivotIndex);
  }

  const getResultChar = (responseString) => (responseString[0] === "R" ? "R" : "B");

  for (let idx = 1; idx <= totalRange; idx++) {
    if (pivotIndicesSet.has(idx)) {
      modifiedPermutation[lastElementIndex] = idx;
      console.log("?", modifiedPermutation.join(" "));
      const responseForQ = yield readNextLine();
      finalResult[idx - 1] = getResultChar(responseForQ);
    } else {
      currentPermutation[lastElementIndex] = idx;
      console.log("?", currentPermutation.join(" "));
      const responseForP = yield readNextLine();
      finalResult[idx - 1] = getResultChar(responseForP);
    }
  }

  console.log("!", finalResult.join(""));
})();

mainLogicGenerator.next();
