class BiDirectionalList {
  constructor() {
    this.leadingItems = [];
    this.trailingItems = [];
  }

  get currentSize() {
    return this.leadingItems.length + this.trailingItems.length;
  }

  addToFront(item) {
    this.leadingItems.push(item);
  }

  addToBack(item) {
    this.trailingItems.push(item);
  }

  fetchFront() {
    if (this.leadingItems.length > 0) return this.leadingItems[this.leadingItems.length - 1];
    if (this.trailingItems.length > 0) return this.trailingItems[0];
    return undefined;
  }

  fetchBack() {
    if (this.trailingItems.length > 0) return this.trailingItems[this.trailingItems.length - 1];
    if (this.leadingItems.length > 0) return this.leadingItems[0];
    return undefined;
  }

  produceSequence() {
    return [...this.leadingItems.reverse(), ...this.trailingItems];
  }
}

function parseNumericValue(textValue) {
  return Number(textValue);
}

function calculateDisparitySum(numberSequence) {
  if (numberSequence.length < 2) {
    return 0;
  }
  const recurseAndSum = (subSequence, currentSum) => {
    if (subSequence.length < 2) {
      return currentSum;
    }
    const head = subSequence[0];
    const next = subSequence[1];
    return recurseAndSum(subSequence.slice(1), currentSum + Math.abs(head - next));
  };
  return recurseAndSum(numberSequence, 0);
}

function constructArrangementCore(
  originalSortedNumbers,
  currentLeftSourcePointer,
  currentRightSourcePointer,
  resultingContainer,
  maximumDesiredSize,
  currentDecisionPhase
) {
  if (resultingContainer.currentSize >= maximumDesiredSize) {
    return resultingContainer.produceSequence();
  }

  let nextLeftSourcePointer = currentLeftSourcePointer;
  let nextRightSourcePointer = currentRightSourcePointer;
  let nextDecisionPhase = (currentDecisionPhase === 'startSmall') ? 'startLarge' : 'startSmall';

  if (resultingContainer.currentSize === 0) {
    let chosenValue;
    if (currentDecisionPhase === 'startSmall') {
      chosenValue = originalSortedNumbers[nextLeftSourcePointer++];
    } else {
      chosenValue = originalSortedNumbers[nextRightSourcePointer--];
    }
    resultingContainer.addToBack(chosenValue);
    return constructArrangementCore(
      originalSortedNumbers, nextLeftSourcePointer, nextRightSourcePointer,
      resultingContainer, maximumDesiredSize, nextDecisionPhase
    );
  }

  let primaryElement;
  let secondaryElement;

  if (currentDecisionPhase === 'startSmall') {
    primaryElement = originalSortedNumbers[nextLeftSourcePointer++];
    secondaryElement = originalSortedNumbers[nextLeftSourcePointer++];
  } else {
    primaryElement = originalSortedNumbers[nextRightSourcePointer--];
    secondaryElement = originalSortedNumbers[nextRightSourcePointer--];
  }

  const existingFront = resultingContainer.fetchFront();
  const existingBack = resultingContainer.fetchBack();

  const disparityToFront = Math.abs(existingFront - primaryElement);
  const disparityToBack = Math.abs(existingBack - primaryElement);

  if (disparityToFront > disparityToBack) {
    resultingContainer.addToFront(primaryElement);
    if (resultingContainer.currentSize < maximumDesiredSize) {
      resultingContainer.addToBack(secondaryElement);
    }
  } else {
    resultingContainer.addToBack(primaryElement);
    if (resultingContainer.currentSize < maximumDesiredSize) {
      resultingContainer.addToFront(secondaryElement);
    }
  }

  return constructArrangementCore(
    originalSortedNumbers, nextLeftSourcePointer, nextRightSourcePointer,
    resultingContainer, maximumDesiredSize, nextDecisionPhase
  );
}

function generateOptimalArrangement(initialMode, sourceCollection, desiredAmount) {
  const sortedSourceCopy = [...sourceCollection].sort((valA, valB) => valA - valB);
  const newResultContainer = new BiDirectionalList();
  return constructArrangementCore(
    sortedSourceCopy,
    0,
    sortedSourceCopy.length - 1,
    newResultContainer,
    desiredAmount,
    initialMode
  );
}

function orchestrateCalculation(rawInputText) {
  const lines = rawInputText.split("\n");
  const parsedNumbers = lines.map(parseNumericValue);

  const totalCount = parsedNumbers[0];
  const initialItems = parsedNumbers.slice(1, totalCount + 1);

  const arrangementA = generateOptimalArrangement('startSmall', [...initialItems], totalCount);
  const arrangementB = generateOptimalArrangement('startLarge', [...initialItems], totalCount);

  const scoreA = calculateDisparitySum(arrangementA);
  const scoreB = calculateDisparitySum(arrangementB);

  process.stdout.write(Math.max(scoreA, scoreB).toString());
}

orchestrateCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));