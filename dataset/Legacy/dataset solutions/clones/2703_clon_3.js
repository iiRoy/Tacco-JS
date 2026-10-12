const parseInputLines = (rawInputData) => {
  const allLines = rawInputData.split("\n");
  const elementCount = parseInt(allLines[0], 10);
  const arrayAValues = allLines[1].split(' ').map((val) => parseInt(val, 10));
  const arrayBValues = allLines[2].split(' ').map((val) => parseInt(val, 10));
  return { elementCount, arrayAValues, arrayBValues };
};

const calculateSumOfArray = (numericCollection) => {
  return numericCollection.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

function processInput(rawData) {
  const { elementCount, arrayAValues, arrayBValues } = parseInputLines(rawData);

  const finalResults = [];
  const carryOverB = [];

  const firstAValue = arrayAValues[0];
  const firstBValue = arrayBValues[0];

  if (firstAValue >= firstBValue) {
    finalResults[0] = firstBValue;
    carryOverB[0] = 0;
  } else {
    finalResults[0] = firstAValue;
    carryOverB[0] = firstBValue - firstAValue;
  }

  for (let idx = 1; idx < elementCount + 1; idx++) {
    const currentAValue = arrayAValues[idx];
    const currentBValue = arrayBValues[idx];
    const previousCarryOver = carryOverB[idx - 1];

    const availableAForCurrentB = currentAValue - previousCarryOver;

    if (availableAForCurrentB >= currentBValue) {
      finalResults[idx] = previousCarryOver + currentBValue;
      carryOverB[idx] = 0;
    } else {
      finalResults[idx] = currentAValue;
      carryOverB[idx] = currentBValue - availableAForCurrentB;
    }
  }

  console.log(calculateSumOfArray(finalResults));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
