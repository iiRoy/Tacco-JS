class GameToken { // Represents a single game token with a suit and rank
  constructor(mkVal, numVal) {
    this.suitDesignation = String(mkVal); // Store the suit as a string
    this.rankValue = Number(numVal);      // Store the rank as a number
  }

  matchExactly(anotherToken) { // Checks if two tokens are identical in suit and rank
    return this.rankValue === anotherToken.rankValue && this.suitDesignation === anotherToken.suitDesignation;
  }

  compareRanks(otherToken) { // Compares the rank of this token with another
    if (this.rankValue === otherToken.rankValue) {
      return 0; // Tokens have the same rank
    }
    else if (this.rankValue < otherToken.rankValue) {
      return -1; // This token has a lower rank
    }
    else {
      return 1; // This token has a higher rank
    }
  }

  getTextRepresentation() { // Provides a string representation of the token
    return `${this.suitDesignation} ${this.rankValue}`
  }
}

(function runProcess(){ // Main execution block for the program
  const dataLines = require('fs') . readFileSync('/dev/stdin', 'utf8') . trim() . split('\n');
  const itemCount = Number( dataLines.shift() ); // Get the total number of items from the first line
  const initialCollection = dataLines.map( r => r.split(' ') ) . map( c => new GameToken(c[0], c[1]) );
  const temporaryCollection = initialCollection.concat(); // Create a shallow copy for sorting

  rapidSort(temporaryCollection, 0, itemCount - 1); // Perform the rapid sort on the copy

  // Check if the sort was stable by comparing with a built-in sort
  console.log(
    initialCollection.sort( (first, second) => first.compareRanks(second) ) . every(
      (tokenItem, idx) => tokenItem.matchExactly(temporaryCollection[idx])
    )
      ? 'Stable' // Output if the sort maintained relative order of equal elements
      : 'Not stable' // Output if stability was not maintained
  );
  console.log( temporaryCollection.join('\n') ); // Output the sorted collection
})();

// Function to perform a rapid sort (Quicksort) on an array of GameTokens
function rapidSort(targetArray, startIndex, endIndex) {
  // Inner helper function to partition the array
  const pivotDivide = function(dataSet, lowIndex, highIndex) {
     let pivotElement = dataSet[highIndex]; // Choose the last element as the pivot
     let leftPointer = lowIndex - 1; // Pointer for elements smaller than pivot

     // Iterate through the array from lowIndex to highIndex - 1
     for (let rightIterator = lowIndex; rightIterator < highIndex; rightIterator++) {
       // If current element is less than or equal to the pivot
       if ( dataSet[rightIterator].compareRanks(pivotElement) <= 0 ) {
         leftPointer++; // Move the left pointer
         // Swap elements
         [ dataSet[leftPointer], dataSet[rightIterator] ] = [ dataSet[rightIterator], dataSet[leftPointer] ];
       }
     }
     // Place the pivot element in its correct sorted position
     [ dataSet[leftPointer + 1], dataSet[highIndex] ] = [ dataSet[highIndex], dataSet[leftPointer + 1] ];
     return leftPointer + 1; // Return the partition index
  }

  // Redefine rapidSort as the recursive function
  rapidSort = function(dataChunk, startPos, endPos) {
    if (startPos < endPos) { // Only sort if the sub-array has more than one element
      let partitionPoint = pivotDivide(dataChunk, startPos, endPos); // Get the pivot's final position
      rapidSort(dataChunk, startPos, partitionPoint - 1); // Recursively sort the left sub-array
      rapidSort(dataChunk, partitionPoint + 1, endPos); // Recursively sort the right sub-array
    }
  }
  rapidSort(targetArray, startIndex, endIndex); // Initial call to the recursive rapid sort
}