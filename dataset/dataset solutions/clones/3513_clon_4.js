const processDataAndDeriveOutcome = (initialTextContent) => {
  const sectionedContent = initialTextContent.trim().split('\n');
  const numericHeaderValue = Number(sectionedContent[0]);
  const elementsFromSecondLine = sectionedContent[1].split(' ');

  const elementFrequencyMap = elementsFromSecondLine.reduce((accumulatorMap, currentElementKey) => {
    accumulatorMap.set(currentElementKey, (accumulatorMap.get(currentElementKey) || 0) + 1);
    return accumulatorMap;
  }, new Map());

  const structuredElementList = Array.from(elementFrequencyMap.entries()).map(([identifier, count]) => ({
    itemIdentity: identifier,
    occurrenceCount: count
  }));

  const sortedStructuredList = structuredElementList.sort((itemA, itemB) => itemB.occurrenceCount - itemA.occurrenceCount);

  const distinctElementCount = sortedStructuredList.length;

  let finalCalculationResult;

  if (distinctElementCount === 1) {
    finalCalculationResult = numericHeaderValue / 2;
  } else if (distinctElementCount === 2) {
    const topElement = sortedStructuredList[0];
    const secondTopElement = sortedStructuredList[1];

    if (topElement.occurrenceCount === secondTopElement.occurrenceCount) {
      finalCalculationResult = 0;
    } else {
      finalCalculationResult = (topElement.occurrenceCount - secondTopElement.occurrenceCount) / 2;
    }
  } else {
    finalCalculationResult = sortedStructuredList.slice(2).reduce((totalSum, currentItemObject) => totalSum + currentItemObject.occurrenceCount, 0);
  }

  return finalCalculationResult;
};

const initiateProcessing = (dataSource) => {
  console.log(processDataAndDeriveOutcome(dataSource));
};

initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));