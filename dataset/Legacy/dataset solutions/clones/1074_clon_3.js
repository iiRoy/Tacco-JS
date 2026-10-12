class PlayingCard {
  constructor(suitSymbol, rankValue) {
    this.suitSymbol = String(suitSymbol);
    this.rankValue = Number(rankValue);
  }

  // Internal helper for comparison logic to split the compareWith method
  _determineComparisonResult(otherCard) {
    if (this.rankValue < otherCard.rankValue) {
      return -1;
    } else if (this.rankValue > otherCard.rankValue) {
      return 1;
    } else {
      return 0; // Ranks are identical
    }
  }

  isSameAs(otherCard) {
    return this.rankValue === otherCard.rankValue && this.suitSymbol === otherCard.suitSymbol;
  }

  compareWith(otherCard) {
    return this._determineComparisonResult(otherCard);
  }

  displayCard() {
    // Provides a string representation of the card
    return `${this.suitSymbol} ${this.rankValue}`;
  }
}

// Helper function to handle input reading and initial card parsing
function parseInputCards() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const rawInputLines = fileContent.split('\n');
  const totalCardCount = Number(rawInputLines.shift());
  const initialCardObjects = [];

  // Iterate through raw lines to create PlayingCard instances
  for (const lineEntry of rawInputLines) {
    const cardParts = lineEntry.split(' ');
    initialCardObjects.push(new PlayingCard(cardParts[0], cardParts[1]));
  }
  return { totalCardCount, initialCardObjects };
}

// Helper function to evaluate the stability of the quicksort
function evaluateSortingStability(originalCardList, sortedCardList) {
  // Create an array of objects preserving original indices for stability check
  const indexedOriginalCards = originalCardList.map((cardInstance, originalPosition) => ({
    cardInstance: cardInstance,
    originalPosition: originalPosition
  }));

  // Sort this indexed list to determine the truly stable order
  const stableSortedOrder = indexedOriginalCards.sort((cardA, cardB) => {
    const rankComparisonResult = cardA.cardInstance.compareWith(cardB.cardInstance);
    if (rankComparisonResult !== 0) {
      return rankComparisonResult;
    }
    // If ranks are equal, use original position to maintain stability
    return cardA.originalPosition - cardB.originalPosition;
  });

  // Compare the quicksort result with the stable sorted order
  const isSortStable = stableSortedOrder.every((stableEntry, currentIdx) => {
    return stableEntry.cardInstance.isSameAs(sortedCardList[currentIdx]);
  });

  return isSortStable ? 'Stable' : 'Not stable';
}

(function executeProgram() {
  const { totalCardCount, initialCardObjects } = parseInputCards();
  const quickSortedCardCollection = Array.from(initialCardObjects); // Create a mutable copy for sorting

  performQuickSort(quickSortedCardCollection, 0, totalCardCount - 1);

  const stabilityReport = evaluateSortingStability(initialCardObjects, quickSortedCardCollection);
  console.log(stabilityReport);

  // Format and print the quick-sorted cards
  const outputLines = quickSortedCardCollection.map(card => card.displayCard()).join('\n');
  console.log(outputLines);
})();

function performQuickSort(cardArray, startIndex, endIndex) {

  // Inner helper function for the partitioning step of QuickSort
  const divideAndConquer = (arr, lowIndex, highIndex) => {
    const pivotElement = arr[highIndex]; // Choose the last element as pivot
    let boundaryIndex = lowIndex - 1; // Index of smaller element

    for (let currentScanIndex = lowIndex; currentScanIndex < highIndex; currentScanIndex++) {
      // If current element is less than or equal to the pivot
      const comparisonOutcome = arr[currentScanIndex].compareWith(pivotElement);
      if (comparisonOutcome <= 0) {
        boundaryIndex++;
        // Swap arr[boundaryIndex] and arr[currentScanIndex]
        const tempSwapValue = arr[boundaryIndex];
        arr[boundaryIndex] = arr[currentScanIndex];
        arr[currentScanIndex] = tempSwapValue;
      }
    }

    // Place the pivot element at its correct position
    const finalPivotPosition = boundaryIndex + 1;
    const tempPivotSwap = arr[finalPivotPosition];
    arr[finalPivotPosition] = arr[highIndex];
    arr[highIndex] = tempPivotSwap;

    return finalPivotPosition;
  };

  // Recursive helper function for QuickSort
  const recursiveQuickSort = (arr, p, r) => {
    // Base case: if the sub-array has 0 or 1 element, it's already sorted
    if (p < r) {
      const pivotFinalIndex = divideAndConquer(arr, p, r);
      recursiveQuickSort(arr, p, pivotFinalIndex - 1); // Sort the left partition
      recursiveQuickSort(arr, pivotFinalIndex + 1, r); // Sort the right partition
    }
  };

  // Initiate the recursive quicksort process
  recursiveQuickSort(cardArray, startIndex, endIndex);
}
