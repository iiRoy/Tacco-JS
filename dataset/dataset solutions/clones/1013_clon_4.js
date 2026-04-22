const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputRows = rawInputData.trim().split('\n');
const collectionSize = parseInt(inputRows[0], 10);
const numericalCollection = inputRows.slice(1, collectionSize + 1).map(Number);

function deriveDecrements(datasetLimit) {
  const decrementList = [];
  const recursiveGenerator = (currentStep) => {
    if (currentStep >= datasetLimit) {
      return;
    }
    recursiveGenerator(currentStep * 3 + 1);
    decrementList.push(currentStep);
  };
  recursiveGenerator(1);
  return decrementList;
}

function applyGapSort(dataContainer, gapValue, comparisonTally) {
  for (let currentPosition = gapValue; currentPosition < dataContainer.length; currentPosition++) {
    const itemToPlace = dataContainer[currentPosition];

    const shiftElementsRecursively = (checkIndex) => {
      if (checkIndex < 0 || dataContainer[checkIndex] <= itemToPlace) {
        return checkIndex;
      }
      dataContainer[checkIndex + gapValue] = dataContainer[checkIndex];
      comparisonTally.value++;
      return shiftElementsRecursively(checkIndex - gapValue);
    };

    const finalInsertionPoint = shiftElementsRecursively(currentPosition - gapValue);
    dataContainer[finalInsertionPoint + gapValue] = itemToPlace;
  }
}

function orchestrateSorting(dataArray) {
  const comparisonTracker = { value: 0 };
  const incrementSequence = deriveDecrements(dataArray.length);

  incrementSequence.forEach(stepIncrement => {
    applyGapSort(dataArray, stepIncrement, comparisonTracker);
  });

  return {
    sortedGaps: incrementSequence,
    totalShiftOperations: comparisonTracker.value,
  };
}

const sortingResult = orchestrateSorting(numericalCollection);

let finalOutput = "";
finalOutput += sortingResult.sortedGaps.length + '\n';
finalOutput += sortingResult.sortedGaps.join(" ") + '\n';
finalOutput += sortingResult.totalShiftOperations + '\n';
finalOutput += numericalCollection.map(String).join('\n');

process.stdout.write(finalOutput);