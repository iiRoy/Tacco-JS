(function performSortTask() {
  const fileSystemModule = require('node:fs');
  const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const inputDataSegments = rawInputContent.trim().split('\n');

  const totalElementsCount = parseInt(inputDataSegments.shift(), 10);
  const originalNumericSequence = inputDataSegments.shift().split(' ').map(val => parseInt(val, 10));

  function combineSortedHalves(leftCollection, rightCollection) {
    let combinedOutput = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftCollection.length && rightIndex < rightCollection.length) {
      if (leftCollection[leftIndex] < rightCollection[rightIndex]) {
        combinedOutput.push(leftCollection[leftIndex]);
        leftIndex++;
      } else {
        combinedOutput.push(rightCollection[rightIndex]);
        rightIndex++;
      }
    }

    while (leftIndex < leftCollection.length) {
      combinedOutput.push(leftCollection[leftIndex]);
      leftIndex++;
    }
    while (rightIndex < rightCollection.length) {
      combinedOutput.push(rightCollection[rightIndex]);
      rightIndex++;
    }

    return combinedOutput;
  }

  function divideAndConquerSort(sequenceToOrder) {
    if (sequenceToOrder.length <= 1) {
      return sequenceToOrder;
    }

    const midpoint = Math.floor(sequenceToOrder.length / 2);
    const leftSubsequence = sequenceToOrder.slice(0, midpoint);
    const rightSubsequence = sequenceToOrder.slice(midpoint);

    const sortedLeft = divideAndConquerSort(leftSubsequence);
    const sortedRight = divideAndConquerSort(rightSubsequence);

    return combineSortedHalves(sortedLeft, sortedRight);
  }

  const resultantSortedCollection = divideAndConquerSort(originalNumericSequence);

  process.stdout.write(resultantSortedCollection.join(' '));
})();