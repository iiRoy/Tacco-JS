function parseInteger (inputString) {
  return parseInt(inputString);
}

function calculateAbsoluteDifferencesSum (numberArray) {
  let totalDifference = 0;
  for (let idx = 0; idx < numberArray.length - 1; idx++) {
    totalDifference += Math.abs(numberArray[idx] - numberArray[idx + 1]);
  }
  return totalDifference;
}

function buildSequenceFromEnds (currentPickStrategy, sourceElements, targetSize) {
  const generatedSequence = [];

  const getAndRemoveFront = (arr) => arr.shift();
  const getAndRemoveBack = (arr) => arr.pop();

  while (generatedSequence.length < targetSize) {
    let elementToProcess;
    let nextElementForPairing;

    if (currentPickStrategy === 'min') {
      elementToProcess = getAndRemoveFront(sourceElements);
      if (generatedSequence.length === 0) {
        generatedSequence.push(elementToProcess);
      } else {
        const diffToFront = Math.abs(generatedSequence[0] - elementToProcess);
        const diffToBack = Math.abs(generatedSequence[generatedSequence.length - 1] - elementToProcess);

        if (diffToFront > diffToBack) {
          generatedSequence.unshift(elementToProcess);
          if (generatedSequence.length < targetSize) {
            nextElementForPairing = getAndRemoveFront(sourceElements);
            generatedSequence.push(nextElementForPairing);
          }
        } else {
          generatedSequence.push(elementToProcess);
          if (generatedSequence.length < targetSize) {
            nextElementForPairing = getAndRemoveFront(sourceElements);
            generatedSequence.unshift(nextElementForPairing);
          }
        }
      }
      currentPickStrategy = 'max';
    } else { // currentPickStrategy === 'max'
      elementToProcess = getAndRemoveBack(sourceElements);
      if (generatedSequence.length === 0) {
        generatedSequence.push(elementToProcess);
      } else {
        const diffToFront = Math.abs(generatedSequence[0] - elementToProcess);
        const diffToBack = Math.abs(generatedSequence[generatedSequence.length - 1] - elementToProcess);

        if (diffToFront > diffToBack) {
          generatedSequence.unshift(elementToProcess);
          if (generatedSequence.length < targetSize) {
            nextElementForPairing = getAndRemoveBack(sourceElements);
            generatedSequence.push(nextElementForPairing);
          }
        } else {
          generatedSequence.push(elementToProcess);
          if (generatedSequence.length < targetSize) {
            nextElementForPairing = getAndRemoveBack(sourceElements);
            generatedSequence.unshift(nextElementForPairing);
          }
        }
      }
      currentPickStrategy = 'min';
    }
  }
  return generatedSequence;
}

function processInputAndCalculateMaxDiff (rawInputContent) {
  const allParsedNumbers = rawInputContent.split("\n").map(parseInteger);
  const elementCount = allParsedNumbers[0];
  let currentPermutation = allParsedNumbers.slice(1, elementCount + 1);

  let maximumDifferenceFound = 0;
  const MAX_SHUFFLE_ITERATIONS = 10000;

  const performFisherYatesShuffle = (arr) => {
    let arrayLength = arr.length;
    while (arrayLength > 0) {
      const randomIndex = Math.floor(Math.random() * arrayLength);
      arrayLength--;

      const tempValue = arr[arrayLength];
      arr[arrayLength] = arr[randomIndex];
      arr[randomIndex] = tempValue;
    }
  };

  for (let iterationCounter = 0; iterationCounter < MAX_SHUFFLE_ITERATIONS; iterationCounter++) {
    performFisherYatesShuffle(currentPermutation);

    const currentDifference = calculateAbsoluteDifferencesSum(currentPermutation);
    maximumDifferenceFound = Math.max(maximumDifferenceFound, currentDifference);
  }

  console.log(maximumDifferenceFound);
}

processInputAndCalculateMaxDiff(require("fs").readFileSync("/dev/stdin", "utf8"));
