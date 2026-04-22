var sourceData = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ); // Acquire raw input from standard input stream

// Process the raw input: trim whitespace and split into an array of lines
var dataLines = sourceData.trim().split( "\n" );

// Parse the second line of input into an array of numbers
// The first line usually contains the count, the second line contains the actual elements.
var integerArray = dataLines[1].split(' ').map( ( elementValue ) => parseInt( elementValue, 10 ) );

// Initialize a counter for tracking the total number of element swaps
var swapCounter = 0;

// Outer loop: Iterate through each element of the array
// This loop establishes the boundary for the unsorted part of the array
for ( var mainIterator = 0; mainIterator < integerArray.length; mainIterator++ ) {
  // Assume the current element is the smallest in the unsorted portion
  var currentMinIdx = mainIterator;

  // Inner loop: Search for the actual smallest element in the remaining unsorted part
  for ( var subIterator = mainIterator; subIterator < integerArray.length; subIterator++ ) {
    // If a smaller element is found, update the index of the minimum element
    currentMinIdx = integerArray[subIterator] < integerArray[currentMinIdx] ? subIterator : currentMinIdx;
  }

  // Check if the smallest element found is not at the current position
  // If it's different, a swap is necessary
  if ( currentMinIdx !== mainIterator ) {
    // Perform a three-step swap using a temporary variable
    var swapBuffer = integerArray[currentMinIdx];
    integerArray[currentMinIdx] = integerArray[mainIterator];
    integerArray[mainIterator] = swapBuffer;

    // Increment the swap counter as an exchange occurred
    swapCounter++;
  }
}

// Output the sorted array elements, joined by spaces
console.log( integerArray.join(' ') );

// Output the final count of swaps performed during the sorting process
console.log( swapCounter );