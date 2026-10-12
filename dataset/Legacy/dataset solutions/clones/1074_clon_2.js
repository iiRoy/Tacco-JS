// Defines a class to represent a playing card
class PlayingCard {
  // Constructor initializes a new card instance with a suit and rank
  constructor(suitSymbol, rankValue) {
    this.suit = String(suitSymbol); // Ensure the suit is stored as a string
    this.rank = Number(rankValue);  // Ensure the rank is stored as a number
  }

  // Checks if this card is identical to another card based on both rank and suit
  isIdenticalTo(anotherCard) {
    return this.rank === anotherCard.rank && this.suit === anotherCard.suit;
  }

  // Compares this card's rank with another card's rank
  // Returns 0 if ranks are equal, -1 if this card's rank is lower, 1 if higher
  compareRanks(anotherCard) {
    if (this.rank === anotherCard.rank) {
      return 0; // Ranks are equivalent
    } else if (this.rank < anotherCard.rank) {
      return -1; // This card has a lower rank
    } else {
      return 1; // This card has a higher rank
    }
  }

  // Returns a string representation of the card (e.g., "H 10")
  display() {
    return `${this.suit} ${this.rank}`;
  }
}

// Main execution block of the program, wrapped in an Immediately Invoked Function Expression (IIFE)
(function programEntry() {
  // Read all input from standard input, decode as UTF-8, trim whitespace, and split into an array of lines
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line of input contains the total number of elements (cards)
  const numElements = Number(inputLines.shift());

  // Process the remaining input lines to create an array of PlayingCard objects
  // Each line is split by space to get suit and rank, then a new PlayingCard is created
  const originalCards = inputLines.map(lineStr => lineStr.split(' ')).map(cardParts => new PlayingCard(cardParts[0], cardParts[1]));

  // Create a shallow copy of the original cards array to be sorted by the quick sort algorithm
  const sortedCards = Array.from(originalCards);

  // Call the quick sort function to sort the copied array in place
  // The sort range is from index 0 to numElements - 1
  fastSort(sortedCards, 0, numElements - 1);

  // Determine if the quick sort algorithm maintained stability
  // 1. Map original cards to temporary objects containing the card and its initial index.
  // 2. Sort these temporary objects using a stable comparison: first by card rank, then by original index.
  // 3. Compare this stably sorted list with the quick-sorted list. If all cards match in order, it's stable.
  console.log(
    originalCards
      .map((cardItem, initialPosition) => ({ cardValue: cardItem, initialPosition: initialPosition }))
      .sort((itemA, itemB) => itemA.cardValue.compareRanks(itemB.cardValue) || itemA.initialPosition - itemB.initialPosition)
      .every((currentCardWrapper, sortedPosition) => currentCardWrapper.cardValue.isIdenticalTo(sortedCards[sortedPosition]))
      ? 'Stable'
      : 'Not stable'
  );

  // Output the quick-sorted cards, each on a new line, using their display method
  console.log(sortedCards.join('\n'));
})();

// Main function for the quick sort algorithm
function fastSort(dataArray, startIndex, endIndex) {
  // Helper function to perform the partitioning step of Quick Sort
  const divideAndConquer = function(currentArray, lowIndex, highIndex) {
    // Select the last element as the pivot for partitioning
    let pivotElement = currentArray[highIndex];
    // Initialize a pointer for the smaller element, starting one position before the low index
    let leftPointer = lowIndex - 1;

    // Iterate through the array from the low index up to (but not including) the high index (pivot)
    for (let rightPointer = lowIndex; rightPointer < highIndex; rightPointer++) {
      // If the current element is less than or equal to the pivot element's rank
      if (currentArray[rightPointer].compareRanks(pivotElement) <= 0) {
        leftPointer++; // Increment the left pointer
        // Swap the element at the left pointer with the current element
        [currentArray[leftPointer], currentArray[rightPointer]] = [currentArray[rightPointer], currentArray[leftPointer]];
      }
    }
    // After the loop, swap the pivot element with the element at (leftPointer + 1)
    // This places the pivot in its correct sorted position
    [currentArray[leftPointer + 1], currentArray[highIndex]] = [currentArray[highIndex], currentArray[leftPointer + 1]];
    // Return the index of the pivot element after partitioning
    return leftPointer + 1;
  };

  // The actual recursive quick sort function, which is reassigned to the outer 'fastSort' variable
  fastSort = function(currentArray, lowIndex, highIndex) {
    // Base case for recursion: only proceed if the low index is less than the high index
    // (meaning there are at least two elements to sort in this sub-array)
    if (lowIndex < highIndex) {
      // Perform partitioning and get the pivot's final index
      let pivotIndex = divideAndConquer(currentArray, lowIndex, highIndex);

      // Recursively call fastSort for the sub-array before the pivot
      fastSort(currentArray, lowIndex, pivotIndex - 1);
      // Recursively call fastSort for the sub-array after the pivot
      fastSort(currentArray, pivotIndex + 1, highIndex);
    }
  };
  // Initial call to the recursive quick sort function to start the sorting process
  fastSort(dataArray, startIndex, endIndex);
}
