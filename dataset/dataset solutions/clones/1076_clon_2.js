class PlayingPiece {
  // Initializes a new playing piece with its suit and rank.
  constructor (suitIdentifier, rankValue) {
    this.suitIdentifier = String(suitIdentifier);
    this.rankValue = Number(rankValue);
  }

  /*
   * Checks if this playing piece is equivalent to another.
   * Compares both rank and suit for equality.
   */
  isEquivalentTo (anotherPiece) {
    return this.rankValue === anotherPiece.rankValue && this.suitIdentifier === anotherPiece.suitIdentifier;
  }

  // Compares this playing piece's rank to another's for sorting.
  assessOrder (anotherPiece) {
    if (this.rankValue === anotherPiece.rankValue) {
      return 0;
    } else if (this.rankValue < anotherPiece.rankValue) {
      return -1;
    } else {
      return 1;
    }
  }

  // Provides a string representation of the playing piece.
  representAsString () {
    return `${this.suitIdentifier} ${this.rankValue}`;
  }
}

// Main execution wrapper for the program logic.
(function executeGameLogic () {
  // Read input data from standard input, process it into an array of lines.
  const inputRows = require('node:fs').readFileSync('/dev/fd/0', 'utf8').trim().split('\n');

  // Extract the total count of elements from the first line.
  const totalElementsCount = Number(inputRows.shift());

  /*
   * Parse the remaining input lines into PlayingPiece objects.
   * Each line is split by space to get suit and rank.
   */
  const originalSequence = inputRows.map(rowStr => rowStr.split(' ')).map(itemParts => new PlayingPiece(itemParts[0], itemParts[1]));

  // Create a copy of the sequence to be sorted.
  const sortableSequence = [...originalSequence];

  // Perform the quick sort operation on the copied sequence.
  performQuickSort(sortableSequence, 0, totalElementsCount - 1);

  // Determine if the sorting was stable.
  const stabilityCheckResult = originalSequence
    .map((elementItem, originalIndex) => ({itemValue: elementItem, originalIndex: originalIndex}))
    .sort((firstEntry, secondEntry) => firstEntry.itemValue.assessOrder(secondEntry.itemValue) || firstEntry.originalIndex - secondEntry.originalIndex)
    .every((currentCardData, iteratorPosition) => currentCardData.itemValue.isEquivalentTo(sortableSequence[iteratorPosition]));

  // Output the stability status.
  global.console.log(stabilityCheckResult ? 'Sequence is Stable' : 'Sequence is Unstable');
  // Output the sorted sequence.
  global.console.log(sortableSequence.join('\n'));
})();


// Function to perform quick sort.
function performQuickSort (dataCollection, lowBound, highBound) {

  // Inner helper function to partition the array around a pivot.
  const divideAndConquer = function (dataCollection, lowBound, highBound) {
    let pivotValue = dataCollection[highBound]; // Choose the last element as pivot.
    let leftPointer = lowBound - 1; // Index of smaller element.

    // Iterate through the sub-array.
    for (let rightPointer = lowBound; rightPointer < highBound; rightPointer++) {
      // If current element is less than or equal to pivot.
      if (dataCollection[rightPointer].assessOrder(pivotValue) <= 0) {
        leftPointer++; // Increment index of smaller element.
        // Swap elements at leftPointer and rightPointer.
        [dataCollection[leftPointer], dataCollection[rightPointer]] = [dataCollection[rightPointer], dataCollection[leftPointer]];
      }
    }

    // Swap the pivot element with the element at (leftPointer + 1).
    [dataCollection[leftPointer + 1], dataCollection[highBound]] = [dataCollection[highBound], dataCollection[leftPointer + 1]];

    return leftPointer + 1; // Return the partitioning index.
  }

  // The original quick sort function reassigns itself. We replicate this behavior.
  performQuickSort = function (dataCollection, lowBound, highBound) {
    if (lowBound < highBound) {
      // Find the partition index.
      let partitionIndex = divideAndConquer(dataCollection, lowBound, highBound);

      // Recursively sort elements before and after partition.
      performQuickSort(dataCollection, lowBound, partitionIndex - 1);
      performQuickSort(dataCollection, partitionIndex + 1, highBound);
    }
  }

  // Initial call to the re-assigned recursive quick sort function.
  performQuickSort(dataCollection, lowBound, highBound);
}