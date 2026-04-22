function evaluateSortingCriterion(firstSubject, secondSubject) {
  if (firstSubject.level === secondSubject.level) return 0;
  else if (firstSubject.level < secondSubject.level) return -1;
  else return 1;
}

function checkExactMatch(firstSubject, secondSubject) {
  return firstSubject.level === secondSubject.level && firstSubject.symbol === secondSubject.symbol;
}

function formatSubjectOutput(aSubject) {
  return `${aSubject.symbol} ${aSubject.level}`;
}

function combineOrderedSegments(leftSegment, rightSegment) {
  let combinedResult = [];
  let leftPointer = 0;
  let rightPointer = 0;

  while (leftPointer < leftSegment.length && rightPointer < rightSegment.length) {
    if (evaluateSortingCriterion(leftSegment[leftPointer], rightSegment[rightPointer]) <= 0) {
      combinedResult.push(leftSegment[leftPointer]);
      leftPointer++;
    } else {
      combinedResult.push(rightSegment[rightPointer]);
      rightPointer++;
    }
  }

  return combinedResult.concat(leftSegment.slice(leftPointer)).concat(rightSegment.slice(rightPointer));
}

function performRecursiveOrdering(collectionToOrder) {
  if (collectionToOrder.length <= 1) {
    return collectionToOrder;
  }

  const divisionPoint = Math.floor(collectionToOrder.length / 2);
  const leftHalf = collectionToOrder.slice(0, divisionPoint);
  const rightHalf = collectionToOrder.slice(divisionPoint);

  const orderedLeft = performRecursiveOrdering(leftHalf);
  const orderedRight = performRecursiveOrdering(rightHalf);

  return combineOrderedSegments(orderedLeft, orderedRight);
}

function initiateSortingProcedure() {
  const fileSystemModule = require('node:fs');
  const inputDataLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalSubjectCount = Number(inputDataLines.shift());

  const originalSubjectCollection = inputDataLines.map((lineContent, originalPosition) => {
    const dataParts = lineContent.split(' ');
    return { symbol: dataParts[0], level: Number(dataParts[1]), originIndex: originalPosition };
  });

  const algorithmSortedCollection = performRecursiveOrdering([...originalSubjectCollection]);

  const standardSortedReference = [...originalSubjectCollection].sort((subjectA, subjectB) => {
    const comparisonOutcome = evaluateSortingCriterion(subjectA, subjectB);
    if (comparisonOutcome === 0) {
      return subjectA.originIndex - subjectB.originIndex;
    }
    return comparisonOutcome;
  });

  let isResultStable = true;
  for (let k = 0; k < totalSubjectCount; k++) {
    if (!checkExactMatch(algorithmSortedCollection[k], standardSortedReference[k])) {
      isResultStable = false;
      break;
    }
  }

  console.log(isResultStable ? 'Consistent' : 'Inconsistent');
  console.log(algorithmSortedCollection.map(formatSubjectOutput).join('\n'));
}

initiateSortingProcedure();