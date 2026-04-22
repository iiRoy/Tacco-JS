const dataInputSpecification = { sourcePath: '/dev/stdin' };

const acquireFileContent = (location) => {
  try {
    return require('fs').readFileSync(location, 'utf8');
  } catch (issue) {
    console.error(`Input retrieval failure from ${location}: ${issue.message}`);
    return '';
  }
};

const parseNumericalSequence = (textualData) => {
  const numberMatches = textualData.match(/\d+/g);
  if (!numberMatches) {
    return [];
  }
  return numberMatches.map(Number);
};

const performMergeSortAndCountInversions = (initialCollection) => {

  const combineAndTally = (leftArraySegment, rightArraySegment) => {
    let mergedResult = [];
    let mergeInversionCounter = 0;
    let leftPointer = 0;
    let rightPointer = 0;

    while (leftPointer < leftArraySegment.length && rightPointer < rightArraySegment.length) {
      if (leftArraySegment[leftPointer] <= rightArraySegment[rightPointer]) {
        mergedResult.push(leftArraySegment[leftPointer++]);
      } else {
        mergedResult.push(rightArraySegment[rightPointer++]);
        mergeInversionCounter += (leftArraySegment.length - leftPointer);
      }
    }

    while (leftPointer < leftArraySegment.length) {
      mergedResult.push(leftArraySegment[leftPointer++]);
    }
    while (rightPointer < rightArraySegment.length) {
      mergedResult.push(rightArraySegment[rightPointer++]);
    }

    return { sortedPartition: mergedResult, inversionsDuringMerge: mergeInversionCounter };
  };

  const recursivelyProcessPartition = (currentPartition) => {
    if (currentPartition.length <= 1) {
      return { finalSortedPartition: currentPartition, totalInversionsAccumulated: 0 };
    }

    const midPoint = Math.floor(currentPartition.length / 2);
    const leftHalf = currentPartition.slice(0, midPoint);
    const rightHalf = currentPartition.slice(midPoint);

    const leftProcessingOutcome = recursivelyProcessPartition(leftHalf);
    const rightProcessingOutcome = recursivelyProcessPartition(rightHalf);

    const mergeOutcome = combineAndTally(
      leftProcessingOutcome.finalSortedPartition,
      rightProcessingOutcome.finalSortedPartition
    );

    return {
      finalSortedPartition: mergeOutcome.sortedPartition,
      totalInversionsAccumulated:
        leftProcessingOutcome.totalInversionsAccumulated +
        rightProcessingOutcome.totalInversionsAccumulated +
        mergeOutcome.inversionsDuringMerge,
    };
  };

  return recursivelyProcessPartition(initialCollection);
};

const rawInputContent = acquireFileContent(dataInputSpecification.sourcePath);
const numbersToProcess = parseNumericalSequence(rawInputContent);
const sortingResult = performMergeSortAndCountInversions(numbersToProcess);
console.log(sortingResult.totalInversionsAccumulated);