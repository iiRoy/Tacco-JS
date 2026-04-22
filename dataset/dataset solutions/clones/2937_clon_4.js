const InputFeeder = (sourceText) => {
  const allDataLines = sourceText.trim().split('\n');
  let currentLineIndex = 0;
  let processedLineBuffer = null;
  let processedLineOriginIndex = -1;

  const retrieveNumericItem = () => {
    if (processedLineOriginIndex !== currentLineIndex) {
      if (currentLineIndex >= allDataLines.length) {
        throw new Error("Input exhaustion for numeric item.");
      }
      processedLineBuffer = allDataLines[currentLineIndex].split(' ').reverse();
      processedLineOriginIndex = currentLineIndex;
    }
    const val = Number(processedLineBuffer.pop());
    if (processedLineBuffer.length === 0) {
      currentLineIndex++;
      processedLineBuffer = null;
      processedLineOriginIndex = -1;
    }
    return val;
  };

  const retrieveLineItems = () => {
    if (currentLineIndex >= allDataLines.length) {
      throw new Error("Input exhaustion for line items.");
    }
    const items = allDataLines[currentLineIndex].split(' ').map(Number);
    currentLineIndex++;
    processedLineBuffer = null;
    processedLineOriginIndex = -1;
    return items;
  };

  const retrieveMultipleLines = (count) => {
    const collectedMatrix = [];
    for (let index = 0; index < count; index++) {
      collectedMatrix.push(retrieveLineItems());
    }
    return collectedMatrix;
  };

  return {
    retrieveNumericItem,
    retrieveLineItems,
    retrieveMultipleLines,
  };
};

const constructMultiDimensionalCollection = (initialElement, ...dimensions) => {
  const recursivelyBuild = (currentDimensions, depthLevel) => {
    if (depthLevel === currentDimensions.length) {
      return initialElement;
    }
    const currentDimensionSize = currentDimensions[depthLevel];
    return Array.from({
      length: currentDimensionSize
    }, () => recursivelyBuild(currentDimensions, depthLevel + 1));
  };
  return recursivelyBuild(dimensions, 0);
};

const calculateCompositeSum = () => {
  const dataSource = InputFeeder(require("fs").readFileSync("/dev/stdin", "utf8"));

  const quantityOfElements = dataSource.retrieveNumericItem();
  const quantityOfOperations = dataSource.retrieveNumericItem();

  const elementValues = dataSource.retrieveLineItems().sort((valA, valB) => valA - valB);
  const operationDetails = dataSource.retrieveMultipleLines(quantityOfOperations).sort((opA, opB) => opB[1] - opA[1]);

  const evaluateOffers = (remainingOperations, currentElementSet, itemCursorPosition, totalElementCount) => {
    if (remainingOperations.length === 0 || itemCursorPosition >= totalElementCount) {
      return currentElementSet.reduce((accumulator, value) => accumulator + value, 0);
    }
    const [currentOfferQuantity, currentOfferValue] = remainingOperations[0];
    let operationsToApply = currentOfferQuantity;
    let localCursor = itemCursorPosition;
    while (operationsToApply > 0 && localCursor < totalElementCount) {
      if (currentElementSet[localCursor] < currentOfferValue) {
        currentElementSet[localCursor] = currentOfferValue;
        localCursor++;
        operationsToApply--;
      } else {
        return currentElementSet.reduce((accumulator, value) => accumulator + value, 0);
      }
    }
    return evaluateOffers(
      remainingOperations.slice(1),
      currentElementSet,
      localCursor,
      totalElementCount
    );
  };

  return evaluateOffers(operationDetails, elementValues, 0, quantityOfElements);
};

console.log(calculateCompositeSum());