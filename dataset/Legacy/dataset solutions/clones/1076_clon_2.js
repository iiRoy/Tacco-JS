class PlayingCard {
  /**
   * Constructs a new PlayingCard instance.
   * @param {string} suitSymbol - The suit or mark of the card (e.g., 'S', 'H', 'D', 'C').
   * @param {number} rankValue - The numerical rank of the card (e.g., 1 to 13).
   */
  constructor(suitSymbol, rankValue) {
    // Ensure the suit is stored as a string
    this.suitSymbol = String(suitSymbol);
    // Ensure the rank is stored as a number
    this.rankValue = Number(rankValue);
  }

  /**
   * Checks if this card is identical to another card based on rank and suit.
   * @param {PlayingCard} anotherCard - The other card to compare with.
   * @returns {boolean} True if both cards have the same rank and suit, false otherwise.
   */
  isIdenticalTo(anotherCard) {
    return this.rankValue === anotherCard.rankValue && this.suitSymbol === anotherCard.suitSymbol;
  }

  /**
   * Compares the rank of this card to another card.
   * @param {PlayingCard} anotherCard - The other card to compare with.
   * @returns {number} 0 if ranks are equal, -1 if this card's rank is less, 1 if greater.
   */
  compareRankTo(anotherCard) {
    if (this.rankValue === anotherCard.rankValue) {
      return 0; // Ranks are the same
    } else if (this.rankValue < anotherCard.rankValue) {
      return -1; // This card's rank is lower
    } else {
      return 1; // This card's rank is higher
    }
  }

  /**
   * Returns a string representation of the card.
   * @returns {string} A string like "S 10" or "H 1".
   */
  toDisplayString() {
    return `${this.suitSymbol} ${this.rankValue}`;
  }
}

// Self-executing anonymous function to encapsulate the main program logic.
(function executeProgram() {
  // Read all input lines from standard input, trim whitespace, and split by newline.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the total number of cards.
  const cardCount = Number(inputLines.shift());

  // Parse the remaining lines into an array of PlayingCard objects.
  // Each line is split by space to get suit and rank, then a new PlayingCard is created.
  const originalCards = inputLines
    .map(rawLine => rawLine.split(' '))
    .map(cardParts => new PlayingCard(cardParts[0], cardParts[1]));

  // Create a copy of the original array for sorting.
  const sortedCardsArray = Array.from(originalCards);

  // Perform the quick sort operation on the copied array.
  // The sort range is from index 0 to cardCount - 1.
  performQuickSort(sortedCardsArray, 0, cardCount - 1);

  // Check for stability of the quick sort algorithm.
  // 1. Map original cards to objects containing the card and its original index.
  // 2. Sort this new array based on card rank, then by original index for tie-breaking.
  // 3. Compare the sorted original cards with the quick-sorted array.
  const stabilityCheckResult = originalCards
    .map((currentCard, originalIndex) => ({ cardObject: currentCard, originalIndex: originalIndex }))
    .sort((cardA, cardB) => cardA.cardObject.compareRankTo(cardB.cardObject) || cardA.originalIndex - cardB.originalIndex)
    .every((processedCard, currentPosition) => processedCard.cardObject.isIdenticalTo(sortedCardsArray[currentPosition]));

  // Output the stability result.
  console.log(stabilityCheckResult ? 'Stable' : 'Not stable');
  // Output the sorted cards, each on a new line.
  console.log(sortedCardsArray.join('\n'));
})();

/**
 * Implements the Quick Sort algorithm to sort an array of PlayingCard objects in-place.
 * This specific implementation uses a self-redefining function pattern.
 * @param {PlayingCard[]} dataArray - The array of cards to be sorted.
 * @param {number} startIndex - The starting index of the sub-array to sort.
 * @param {number} endIndex - The ending index of the sub-array to sort.
 */
function performQuickSort(dataArray, startIndex, endIndex) {
  // Inner helper function for partitioning the array around a pivot.
  const divideAndConquer = function(currentArray, lowIndex, highIndex) {
    // Choose the last element as the pivot.
    let pivotElement = currentArray[highIndex];
    // Index of smaller element, indicating the correct position of the pivot found so far.
    let smallerElementIndex = lowIndex - 1;

    // Iterate through the sub-array from lowIndex to highIndex - 1.
    for (let currentElementIndex = lowIndex; currentElementIndex < highIndex; currentElementIndex++) {
      // If current element is less than or equal to the pivot.
      if (currentArray[currentElementIndex].compareRankTo(pivotElement) <= 0) {
        smallerElementIndex++;
        // Swap currentArray[smallerElementIndex] and currentArray[currentElementIndex].
        [currentArray[smallerElementIndex], currentArray[currentElementIndex]] =
          [currentArray[currentElementIndex], currentArray[smallerElementIndex]];
      }
    }

    // Swap currentArray[smallerElementIndex + 1] and currentArray[highIndex] (the pivot).
    [currentArray[smallerElementIndex + 1], currentArray[highIndex]] =
      [currentArray[highIndex], currentArray[smallerElementIndex + 1]];

    // Return the partitioning index.
    return smallerElementIndex + 1;
  };

  // The outer function redefines itself to be the recursive quicksort logic.
  // This is a common pattern to make `divideAndConquer` accessible without global scope or explicit passing.
  performQuickSort = function(currentArray, lowIndex, highIndex) {
    // Base case: if the sub-array has 0 or 1 element, it's already sorted.
    if (lowIndex < highIndex) {
      // Partition the array and get the pivot's final position.
      let pivotFinalIndex = divideAndConquer(currentArray, lowIndex, highIndex);

      // Recursively sort the sub-array before the pivot.
      performQuickSort(currentArray, lowIndex, pivotFinalIndex - 1);
      // Recursively sort the sub-array after the pivot.
      performQuickSort(currentArray, pivotFinalIndex + 1, highIndex);
    }
  };

  // Initial call to the (now redefined) recursive quicksort function.
  performQuickSort(dataArray, startIndex, endIndex);
}
