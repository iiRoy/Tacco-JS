"use strict";

function createMultiDimArray(initialValue) {
  const args = Array.from(arguments);
  let currentLengthIndex = args.length;
  let arrayConstructionExpression = `Array(args[${--currentLengthIndex}]).fill(0).map(item => { return ${initialValue}; })`;
  while (--currentLengthIndex) {
    arrayConstructionExpression = `Array(args[${currentLengthIndex}]).fill(0).map(item => ${arrayConstructionExpression})`;
  }
  return eval(arrayConstructionExpression);
}

const inputReader = require("readline").createInterface(process.stdin, process.stdout);

const mainLogicGenerator = (function* () {
  const readLineAsyncHelper = () => inputReader.once("line", s => mainLogicGenerator.next(s));

  let countString = yield readLineAsyncHelper();
  let count = Number(countString);

  const initialPermutationValues = Array.from({ length: count }, (_, idx) => idx + 1);
  let currentPermutation = [...initialPermutationValues];

  console.log("?", currentPermutation.join(" "));
  let firstQueryResponse = yield readLineAsyncHelper();

  let currentXValue = 1;

  for (;;) {
    const nextPermutationElement = currentXValue + count;
    currentPermutation[currentXValue - 1] = nextPermutationElement;

    console.log("?", currentPermutation.join(" "));
    let latestQueryResponse = yield readLineAsyncHelper();

    if (firstQueryResponse[0] !== latestQueryResponse[0]) {
      break;
    }
    currentXValue++;
  }

  let finalResultArray = [];
  let temporaryPermutation = [];
  const encounteredValues = new Set();

  const twoTimesCount = 2 * count;

  for (let index = 0; index < count - 1; index++) {
    const pElement = (currentXValue + index) % twoTimesCount + 1;
    const qElement = (pElement + count) % twoTimesCount + 1;

    currentPermutation[index] = pElement;
    temporaryPermutation[index] = qElement;
    encounteredValues.add(pElement);
  }

  const executeQueryAndExtractChar = function* (permutationArray, targetIndex, valueToAssign) {
    permutationArray[targetIndex] = valueToAssign;
    console.log("?", permutationArray.join(" "));
    const responseLine = yield readLineAsyncHelper();
    return responseLine[0];
  };

  const lastPermutationSlot = count - 1;

  for (let index = 1; index <= twoTimesCount; index++) {
    let characterOutcome;

    if (encounteredValues.has(index)) {
      characterOutcome = yield* executeQueryAndExtractChar(temporaryPermutation, lastPermutationSlot, index);
    } else {
      characterOutcome = yield* executeQueryAndExtractChar(currentPermutation, lastPermutationSlot, index);
    }
    finalResultArray[index - 1] = characterOutcome;
  }

  console.log("!", finalResultArray.join(""));
})();

mainLogicGenerator.next();
