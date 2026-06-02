function applySequenceLogic(targetSequence, lastPoppedValue, currentBValue) {
  if (lastPoppedValue > currentBValue) {
    targetSequence.push(currentBValue);
    targetSequence.push(currentBValue);
  } else {
    targetSequence.push(lastPoppedValue);
    targetSequence.push(currentBValue);
  }
}

function calculateSum(numberArray) {
  return numberArray.reduce((sumAccumulator, currentNum) => sumAccumulator + currentNum, 0);
}

function ProcessInput(rawData) {
  "use strict";
  const inputLines = rawData.split("\n");

  // The first line (representing 'n' in the original) is consumed
  // to maintain input stream behavior, but its value is not used.
  inputLines.shift(); 

  const bSequenceString = inputLines.shift();
  const bSequence = bSequenceString.split(" ").map(itemStr => {
    const parsedItem = parseInt(itemStr, 10);
    return parsedItem;
  });

  let aSequence = [bSequence[0]];

  for (const currentBElement of bSequence) {
    const lastAElement = aSequence.pop();
    applySequenceLogic(aSequence, lastAElement, currentBElement);
  }

  const finalSum = calculateSum(aSequence);
  console.log(finalSum);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
