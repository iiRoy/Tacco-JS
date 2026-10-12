const permutationStorage = [""];

const generatePermutationsForSize = (
  targetSize,
  currentPermutationString,
  availableIndices,
  resultArray
) => {
  if (currentPermutationString.length === targetSize) {
    resultArray.push(currentPermutationString);
    return;
  }

  for (let idx = 0; idx < targetSize; idx++) {
    if (availableIndices[idx]) {
      availableIndices[idx] = false;
      generatePermutationsForSize(
        targetSize,
        currentPermutationString + idx,
        availableIndices,
        resultArray
      );
      availableIndices[idx] = true;
    }
  }
};

for (let currentPermutationSize = 1; currentPermutationSize <= 10; currentPermutationSize++) {
  permutationStorage[currentPermutationSize] = [];
  const indicesAvailability = new Array(currentPermutationSize).fill(true);

  generatePermutationsForSize(
    currentPermutationSize,
    "",
    indicesAvailability,
    permutationStorage[currentPermutationSize]
  );
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

const parseItemDetails = (lineData) => {
  const parts = lineData.split(" ");
  return {
    name: parts[0],
    weight: Number(parts[1]),
    maxWeight: Number(parts[2]),
  };
};

while (true) {
  const numItems = parseInt(inputLines.shift(), 10);
  if (numItems === 0) {
    break;
  }

  const itemDataList = [];
  for (let i = 0; i < numItems; i++) {
    itemDataList.push(parseItemDetails(inputLines.shift()));
  }

  let minimumWeightedSumRatio = Infinity;
  let bestPermutationIdx = -1;

  permutationStorage[numItems].forEach((permutationString, permIndex) => {
    let currentAccumulatedWeight = 0;
    let currentCalculatedWeightedSum = 0;
    let hasFailedCondition = false;

    for (let orderIndex = 0; orderIndex < numItems; orderIndex++) {
      const originalItemIndex = Number(permutationString[orderIndex]);
      const item = itemDataList[originalItemIndex];

      if (currentAccumulatedWeight > item.maxWeight) {
        hasFailedCondition = true;
        break;
      }

      currentAccumulatedWeight += item.weight;
      currentCalculatedWeightedSum += item.weight * (numItems - orderIndex);
    }

    if (hasFailedCondition) {
      const calculatedRatio = currentCalculatedWeightedSum / currentAccumulatedWeight;
      if (minimumWeightedSumRatio > calculatedRatio) {
        minimumWeightedSumRatio = calculatedRatio;
        bestPermutationIdx = permIndex;
      }
    }
  });

  const finalPermutationString = permutationStorage[numItems][bestPermutationIdx];
  const itemIndicesToPrint = finalPermutationString
    .split("")
    .map((char) => parseInt(char, 10))
    .reverse();

  for (const itemIdx of itemIndicesToPrint) {
    console.log(itemDataList[itemIdx].name);
  }
}
