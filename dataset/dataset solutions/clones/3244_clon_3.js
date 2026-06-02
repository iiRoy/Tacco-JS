function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const numPairs = parseInt(inputLines[0], 10);

  const firstArray = [];
  const secondArray = [];

  // Helper function to parse a single line into two integers
  const parsePairLine = (lineContent) => {
    const parts = lineContent.split(' ');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  };

  for (let lineIndex = 1; lineIndex <= numPairs; lineIndex++) {
    const [valA, valB] = parsePairLine(inputLines[lineIndex]);
    firstArray.push(valA);
    secondArray.push(valB);
  }

  const finalResult = computeAlternatingSum(firstArray, secondArray, numPairs);

  console.log(finalResult);
}

function computeAlternatingSum(currentArrOne, currentArrTwo, pairCount) {
  // Initialize runningSum as undefined to replicate the original 'var o;' behavior.
  // This means if pairCount > 0, the first arithmetic operation will result in NaN,
  // and if pairCount = 0, it will return undefined.
  let runningSum;

  // Small helper function to encapsulate the array modification logic
  const removeElementsAtIndex = (idxToRemove, arr1, arr2) => {
    arr1.splice(idxToRemove, 1);
    arr2.splice(idxToRemove, 1);
  };

  for (let iterationIndex = 0; iterationIndex < pairCount; iterationIndex++) {
    const isEvenIteration = (iterationIndex % 2 === 0);
    let selectedIdx;

    if (isEvenIteration) {
      selectedIdx = determineOptimalIndex(currentArrOne, currentArrTwo);
      runningSum += currentArrOne[selectedIdx]; // undefined + number = NaN
    } else {
      selectedIdx = determineOptimalIndex(currentArrTwo, currentArrOne); // Arguments swapped as per original logic
      runningSum -= currentArrTwo[selectedIdx]; // undefined - number = NaN
    }

    removeElementsAtIndex(selectedIdx, currentArrOne, currentArrTwo);
  }
  return runningSum;
}

// Helper function to find the maximum value in an array manually
function findArrayMax(arr) {
  if (arr.length === 0) {
    return -Infinity; // Consistent with Math.max for empty arrays
  }
  let currentMax = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > currentMax) {
      currentMax = arr[i];
    }
  }
  return currentMax;
}

function determineOptimalIndex(arrOne, arrTwo) {
  let bestCandidateIdx = 0;
  // Replaced Math.max.apply with a manual helper function for structural change
  const currentMaxVal = findArrayMax(arrOne);

  // The original loop condition 'k <= a.length' is preserved.
  // It correctly handles array bounds because arrOne[arrOne.length] is undefined
  // and will not match currentMaxVal (unless currentMaxVal itself is undefined, which it won't be for non-empty arrays).
  for (let searchIterator = 0; searchIterator <= arrOne.length; searchIterator++) {
    // The original tie-breaking logic is preserved:
    // Prioritize indices where arrOne[searchIterator] equals currentMaxVal,
    // and searchIterator is not the current bestCandidateIdx (prefers later indices if arrTwo values are equal),
    // and arrTwo[bestCandidateIdx] is less than or equal to arrTwo[searchIterator].
    if (currentMaxVal === arrOne[searchIterator] && bestCandidateIdx !== searchIterator && arrTwo[bestCandidateIdx] <= arrTwo[searchIterator]) {
      bestCandidateIdx = searchIterator;
    }
  }
  return bestCandidateIdx;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
