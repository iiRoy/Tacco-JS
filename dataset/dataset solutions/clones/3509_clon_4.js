const processInputData = (inputLines) => {
  const firstLineParts = inputLines[0].split(' ');
  const totalElementsCount = Number(firstLineParts[0]);
  const elementValues = inputLines[1].split(' ').map(Number);
  return { totalElementsCount, elementValues };
};

const groupAndCountElements = (elementsList) => {
  const [evenPositionFrequencies, oddPositionFrequencies] = elementsList.reduce(
    ([evenMap, oddMap], currentElement, elementIndex) => {
      const targetMap = (elementIndex % 2 === 0) ? evenMap : oddMap;
      targetMap.set(currentElement, (targetMap.get(currentElement) || 0) + 1);
      return [evenMap, oddMap];
    },
    [new Map(), new Map()]
  );
  return { evenPositionFrequencies, oddPositionFrequencies };
};

const obtainRankedList = (frequencyMap) => {
  return Array.from(frequencyMap.entries()).sort((entryA, entryB) => entryB[1] - entryA[1]);
};

const extractRankedValue = (rankedList, rankPosition) =>
  rankedList.length > rankPosition ? rankedList[rankPosition][0] : undefined;

const extractRankedCount = (rankedList, rankPosition) =>
  rankedList.length > rankPosition ? rankedList[rankPosition][1] : 0;

const calculateTotalReplacements = (frequencyMap, selectedBaseValue) => {
  let replacementTally = 0;
  for (const [elementKey, elementCount] of frequencyMap.entries()) {
    if (elementKey !== selectedBaseValue) {
      replacementTally += elementCount;
    }
  }
  return replacementTally;
};

const processApplication = (sourceData) => {
  const { totalElementsCount, elementValues } = processInputData(sourceData);

  const { evenPositionFrequencies, oddPositionFrequencies } = groupAndCountElements(elementValues);

  const rankedEvenElements = obtainRankedList(evenPositionFrequencies);
  const rankedOddElements = obtainRankedList(oddPositionFrequencies);

  const primaryEvenValue = extractRankedValue(rankedEvenElements, 0);
  const primaryEvenCount = extractRankedCount(rankedEvenElements, 0);
  const secondaryEvenValue = extractRankedValue(rankedEvenElements, 1);
  const secondaryEvenCount = extractRankedCount(rankedEvenElements, 1);

  const primaryOddValue = extractRankedValue(rankedOddElements, 0);
  const primaryOddCount = extractRankedCount(rankedOddElements, 0);
  const secondaryOddValue = extractRankedValue(rankedOddElements, 1);
  const secondaryOddCount = extractRankedCount(rankedOddElements, 1);

  let finalReplacementCount;

  if (primaryEvenValue !== primaryOddValue) {
    finalReplacementCount = calculateTotalReplacements(evenPositionFrequencies, primaryEvenValue) +
                            calculateTotalReplacements(oddPositionFrequencies, primaryOddValue);
  } else {
    const optionA_replacements = calculateTotalReplacements(evenPositionFrequencies, primaryEvenValue) +
                                 calculateTotalReplacements(oddPositionFrequencies, secondaryOddValue);

    const optionB_replacements = calculateTotalReplacements(evenPositionFrequencies, secondaryEvenValue) +
                                 calculateTotalReplacements(oddPositionFrequencies, primaryOddValue);

    if (secondaryEvenValue > secondaryOddValue) {
      finalReplacementCount = optionA_replacements;
    } else {
      finalReplacementCount = optionB_replacements;
    }
  }

  console.log(finalReplacementCount);
};

processApplication(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));