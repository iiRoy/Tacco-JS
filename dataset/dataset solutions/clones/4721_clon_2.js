'use strict';

const performProcessing = cliArgument => {
  const rawLines = cliArgument.trim().split("\n");
  const configParams = rawLines[0].split(" ").map(textVal => parseInt(textVal, 10));
  const itemCount = configParams[0];
  const targetProportion = configParams.slice(1);
  const itemRecords = rawLines.slice(1, itemCount + 1);
  let optimalSelection = [];

  function exploreCombinations(currentLine, currentSelection, currentIndex) {
    if (itemCount <= currentIndex || !currentLine) {
      return;
    }
    const parsedRecord = currentLine.split(" ").map(strValue => parseInt(strValue, 10));
    currentSelection.push({
      paramA: parsedRecord[0],
      paramB: parsedRecord[1],
      value: parsedRecord[2]
    });
    const currentTotalValue = currentSelection.reduce((accum, currentElement) => accum + currentElement.value, 0);
    const currentTotalA = currentSelection.reduce((accumulatorA, elementB) => accumulatorA + elementB.paramA, 0);
    const currentTotalB = currentSelection.reduce((accumulatorA, elementB) => accumulatorA + elementB.paramB, 0);
    let optimalTotalValue;
    if (optimalSelection.length > 0) {
      optimalTotalValue = optimalSelection.reduce((accum, currentElement) => accum + currentElement.value, 0);
    }

    // Prune branch if a better solution is already known and current path exceeds its value.
    if (optimalTotalValue && currentTotalValue > optimalTotalValue) {
      return;
    }

    // If the current combination's ratio matches the target.
    if (calculateSimplifiedRatio(currentTotalA, currentTotalB) === `${targetProportion[0]} ${targetProportion[1]}`) {
      // Update optimal selection if none exists or current is superior.
      if (optimalSelection.length === 0 || (optimalTotalValue && (currentTotalValue < optimalTotalValue))) {
        optimalSelection = currentSelection;
      }
    } else {
      // Continue exploring deeper if the ratio does not match yet.
      exploreCombinations(itemRecords[currentIndex + 1], currentSelection, ++currentIndex);
    }
  }

  itemRecords.forEach((lineText, idx) => {
    let tempSelection = [];
    exploreCombinations(lineText, tempSelection, idx);
  });

  console.log(optimalSelection.length === 0 ? -1 : optimalSelection.reduce((accum, currentElement) => accum + currentElement.value, 0));
};

function calculateSimplifiedRatio(valX, valY) {
  let lesserValue = valX > valY ? valY : valX;
  let reducedA = valX;
  let reducedB = valY;

  for (let divisorIter = 1; divisorIter <= lesserValue; divisorIter++) {
    let tempAStr = String(valX / divisorIter);
    let tempBStr = String(valY / divisorIter);
    if (tempAStr.split(".").length === 1 && tempBStr.split(".").length === 1) {
      reducedA = tempAStr;
      reducedB = tempBStr;
    }
  }

  return `${reducedA} ${reducedB}`;
}

performProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));