function processInput(rawData) {
  const lines = rawData.split("\n");

  const firstLineParts = lines[0].split(" ");
  const numElements = Number(firstLineParts[0]);
  const targetCount = Number(firstLineParts[1]);

  const elementValues = lines[1].split(" ").map(str => Number(str));

  const generateCombinations = (elements, count) => {
    const combinations = [];
    for (let outerIdx = 0; outerIdx < count; outerIdx++) {
      for (let innerIdx = 0; innerIdx <= outerIdx; innerIdx++) {
        const score = elements[outerIdx] + elements[innerIdx];
        const isDiagonal = (outerIdx === innerIdx);
        combinations.push({ scoreValue: score, isSelfPair: isDiagonal });
      }
    }
    return combinations;
  };

  let allCombinations = generateCombinations(elementValues, numElements);

  const findMaxScoreEntry = (combinationsArray) => {
    if (combinationsArray.length === 0) {
      return { entry: null, index: -1 };
    }

    let maxEntry = combinationsArray[0];
    let maxIndex = 0;

    for (let k = 1; k < combinationsArray.length; k++) {
      if (combinationsArray[k].scoreValue > maxEntry.scoreValue) {
        maxEntry = combinationsArray[k];
        maxIndex = k;
      }
    }
    return { entry: maxEntry, index: maxIndex };
  };

  let totalScore = 0;
  let processedItemsCount = 0;

  while (processedItemsCount < targetCount) {
    const { entry: currentMaxEntry, index: maxEntryIndex } = findMaxScoreEntry(allCombinations);

    if (!currentMaxEntry) {
        break;
    }

    let scoreToAdd = 0;
    let itemsToProcess = 0;

    if (currentMaxEntry.isSelfPair || (processedItemsCount + 1 === targetCount)) {
      scoreToAdd = currentMaxEntry.scoreValue;
      itemsToProcess = 1;
    } else {
      scoreToAdd = 2 * currentMaxEntry.scoreValue;
      itemsToProcess = 2;
    }

    totalScore += scoreToAdd;
    processedItemsCount += itemsToProcess;

    allCombinations.splice(maxEntryIndex, 1);
  }

  console.log(totalScore);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
