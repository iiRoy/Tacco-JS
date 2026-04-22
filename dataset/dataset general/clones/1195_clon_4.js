const utilityLibrary = {
  bubbleSort: (arr) => {
    if (!Array.isArray(arr)) return arr;
    if (arr.length <= 1) return arr;
    const workingCopy = [...arr];
    for (let outerIndex = 0; outerIndex < workingCopy.length; outerIndex++) {
      for (let innerIndex = 0; innerIndex < workingCopy.length - 1 - outerIndex; innerIndex++) {
        if (workingCopy[innerIndex] > workingCopy[innerIndex + 1]) {
          [workingCopy[innerIndex], workingCopy[innerIndex + 1]] = [workingCopy[innerIndex + 1], workingCopy[innerIndex]];
        }
      }
    }
    return workingCopy;
  },
  selectionSort: (arr) => {
    if (!Array.isArray(arr)) return arr;
    if (arr.length <= 1) return arr;
    const workingCopy = [...arr];
    for (let outerIndex = 0; outerIndex < workingCopy.length - 1; outerIndex++) {
      let minimumPosition = outerIndex;
      for (let innerIndex = outerIndex + 1; innerIndex < workingCopy.length; innerIndex++) {
        if (workingCopy[innerIndex] < workingCopy[minimumPosition]) {
          minimumPosition = innerIndex;
        }
      }
      if (minimumPosition !== outerIndex) {
        [workingCopy[outerIndex], workingCopy[minimumPosition]] = [workingCopy[minimumPosition], workingCopy[outerIndex]];
      }
    }
    return workingCopy;
  },
  insertionSort: (arr) => {
    if (!Array.isArray(arr)) return arr;
    if (arr.length <= 1) return arr;
    const workingCopy = [...arr];
    for (let outerIndex = 1; outerIndex < workingCopy.length; outerIndex++) {
      let currentElement = workingCopy[outerIndex];
      let innerIndex = outerIndex - 1;
      while (innerIndex >= 0 && workingCopy[innerIndex] > currentElement) {
        workingCopy[innerIndex + 1] = workingCopy[innerIndex];
        innerIndex--;
      }
      workingCopy[innerIndex + 1] = currentElement;
    }
    return workingCopy;
  },
  mergeSort: (arr) => {
    if (!Array.isArray(arr)) return arr;
    if (arr.length <= 1) return arr;
    const combineHalves = (leftPortion, rightPortion) => {
      let mergedResult = [];
      let leftPointer = 0;
      let rightPointer = 0;
      while (leftPointer < leftPortion.length && rightPointer < rightPortion.length) {
        if (leftPortion[leftPointer] < rightPortion[rightPointer]) {
          mergedResult.push(leftPortion[leftPointer]);
          leftPointer++;
        } else {
          mergedResult.push(rightPortion[rightPointer]);
          rightPointer++;
        }
      }
      return mergedResult.concat(leftPortion.slice(leftPointer)).concat(rightPortion.slice(rightPointer));
    };
    const middlePoint = Math.floor(arr.length / 2);
    const firstHalf = arr.slice(0, middlePoint);
    const secondHalf = arr.slice(middlePoint);
    return combineHalves(utilityLibrary.mergeSort(firstHalf), utilityLibrary.mergeSort(secondHalf));
  },
  quickSort: (arr) => {
    if (!Array.isArray(arr)) return arr;
    if (arr.length <= 1) return arr;
    const pivotValue = arr[Math.floor(arr.length / 2)];
    const lesserElements = [];
    const greaterElements = [];
    const equalElements = [];
    for (let item of arr) {
      if (item < pivotValue) {
        lesserElements.push(item);
      } else if (item > pivotValue) {
        greaterElements.push(item);
      } else {
        equalElements.push(item);
      }
    }
    return utilityLibrary.quickSort(lesserElements).concat(equalElements, utilityLibrary.quickSort(greaterElements));
  }
};

const algorithmEnumeration = ['Bubble', 'Selection', 'Insertion', 'Merge', 'Quick'];

let totalAssertions = 0;
let failedAssertions = 0;
let currentValidationSetName = '';

const produceReport = (validationSetName, validationDescription, successStatus) => {
  totalAssertions++;
  if (!successStatus) {
    failedAssertions++;
    console.log(`[FAILED] ${validationSetName}: ${validationDescription}`);
  }
};

const performDeepComparison = (valueA, valueB) => {
  if (Object.is(valueA, valueB)) return true;
  if (typeof valueA !== 'object' || valueA === null ||
    typeof valueB !== 'object' || valueB === null) {
    return false;
  }
  if (Array.isArray(valueA) && Array.isArray(valueB)) {
    if (valueA.length !== valueB.length) return false;
    for (let idx = 0; idx < valueA.length; idx++) {
      if (!performDeepComparison(valueA[idx], valueB[idx])) return false;
    }
    return true;
  }
  if (Array.isArray(valueA) !== Array.isArray(valueB)) return false;

  const keysA = Object.keys(valueA);
  const keysB = Object.keys(valueB);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !performDeepComparison(valueA[key], valueB[key])) {
      return false;
    }
  }
  return true;
};

const initiateValidation = (actualResult) => ({
  toPreciselyMatch: (expectedResult, testDescription) => {
    const isSuccess = Object.is(actualResult, expectedResult);
    produceReport(currentValidationSetName, testDescription, isSuccess);
  },
  toEquivalentlyMatch: (expectedResult, testDescription) => {
    const isSuccess = performDeepComparison(actualResult, expectedResult);
    produceReport(currentValidationSetName, testDescription, isSuccess);
  }
});

const defineValidationSet = (setName, validationProcedure) => {
  currentValidationSetName = setName;
  console.log(`\n--- Executing validation for: ${setName} ---`);
  validationProcedure();
};

const rawNumberCollection = [3195, 4189, 2547, 8543, 1533, 5456, 4980, 1849,
  8041, 6036, 7067, 8579, 6590, 6739, 8293, 853, 5732, 8730, 7492, 2652,
  8207, 9959, 2027, 5756, 1927, 3286, 9304, 3001, 2565, 5737, 826, 1927,
  7924, 4521, 8105, 8195, 9879, 7951, 2774, 1362, 2970, 9007, 5191, 4109,
  5494, 8192, 7136, 5971, 3631, 4991, 6735, 9593, 9660, 2064, 4619, 6553,
  8229, 437, 5385, 5476, 7482, 6320, 6788, 6887, 9482, 9740, 7696, 4113,
  9902, 1229, 8704, 9150, 7396, 1611, 4369, 361, 1830, 5033, 1088, 4501,
  7430, 4119, 4767, 1844, 1484, 517, 6017, 5574, 2003, 8380, 6837, 494,
  3422, 1608, 9448, 1764, 2824, 9932, 2566, 4204];

const orderedNumberCollection = [361, 437, 494, 517, 826, 853, 1088, 1229, 1362, 1484,
  1533, 1608, 1611, 1764, 1830, 1844, 1849, 1927, 1927, 2003, 2027, 2064,
  2547, 2565, 2566, 2652, 2774, 2824, 2970, 3001, 3195, 3286, 3422, 3631,
  4109, 4113, 4119, 4189, 4204, 4369, 4501, 4521, 4619, 4767, 4980, 4991,
  5033, 5191, 5385, 5456, 5476, 5494, 5574, 5732, 5737, 5756, 5971, 6017,
  6036, 6320, 6553, 6590, 6735, 6739, 6788, 6837, 6887, 7067, 7136, 7396,
  7430, 7482, 7492, 7696, 7924, 7951, 8041, 8105, 8192, 8195, 8207, 8229,
  8293, 8380, 8543, 8579, 8704, 8730, 9007, 9150, 9304, 9448, 9482, 9593,
  9660, 9740, 9879, 9902, 9932, 9959];

algorithmEnumeration.forEach(algoNameIdentifier => {
  const specificFunctionName = algoNameIdentifier.toLowerCase() + 'Sort';
  const processingAlgorithm = utilityLibrary[specificFunctionName];

  defineValidationSet(algoNameIdentifier + 'ProcessingUnit', () => {
    initiateValidation(processingAlgorithm(null)).toPreciselyMatch(null, 'should yield the input, if the supplied argument is not an array (null)');
    initiateValidation(processingAlgorithm({})).toEquivalentlyMatch({}, 'should yield the input, if the supplied argument is not an array (object)');
    initiateValidation(processingAlgorithm(7)).toPreciselyMatch(7, 'should yield the input, if the supplied argument is not an array (number)');
    initiateValidation(processingAlgorithm('hi')).toPreciselyMatch('hi', 'should yield the input, if the supplied argument is not an array (string)');

    initiateValidation(processingAlgorithm([])).toEquivalentlyMatch([], 'should yield an empty array if the initial array is empty');

    initiateValidation(processingAlgorithm([5])).toEquivalentlyMatch([5], 'should yield the array if it comprises a single element');

    initiateValidation(processingAlgorithm([5, 9])).toEquivalentlyMatch([5, 9], 'should correctly order a two-element array (already ordered)');
    initiateValidation(processingAlgorithm([9, 5])).toEquivalentlyMatch([5, 9], 'should correctly order a two-element array (unordered)');

    initiateValidation(processingAlgorithm([9, 5, 2, 1, 3])).toEquivalentlyMatch([1, 2, 3, 5, 9], 'should correctly order an array containing an odd count of elements');

    initiateValidation(processingAlgorithm([2, 1, 5, 2, 1, 3])).toEquivalentlyMatch([1, 1, 2, 2, 3, 5], 'should correctly order an array with duplicated elements');

    initiateValidation(processingAlgorithm(rawNumberCollection)).toEquivalentlyMatch(orderedNumberCollection, 'should correctly order a substantial array');
  });
});

console.log(`\n--- Comprehensive Validation Report ---`);
if (failedAssertions > 0) {
  console.log(`Overall assertions executed: ${totalAssertions}, Unsuccessful: ${failedAssertions}`);
} else {
  console.log(`All ${totalAssertions} assertions passed without any failures.`);
}