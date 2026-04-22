'use strict'; // Enforce strict mode for cleaner code

const   upperBoundValue  =  109; // Defines the maximum possible value for elements

function  countBasedOrder ( sourceElements ) { // Sorts an array using counting sort algorithm
  const   finalArrangement  =  []; // Stores the sorted output
  const   frequencyStore  =  Array.apply( null, { length: upperBoundValue + 1 } ).map(val => 0); // Initializes an array to store counts

  // Increment counts for each element in the input
  for  ( let  position  in  sourceElements ) {
    frequencyStore[sourceElements[position]]++;
  }

  // Populate the sorted array based on frequencies
  for   ( let  position  in  frequencyStore ) {
    while   ( frequencyStore[position] ) {
      finalArrangement.push( parseInt(position) ); // Add element to sorted list
      frequencyStore[position]--; // Decrement count
    }
  }

  return  finalArrangement; // Return the ordered list
}

function  entryPoint ( initialString ) { // Main function to process data
  let   numericData = initialString.split( /\n|\s/ ).map( numStr => parseInt(numStr) ); // Parse input string into numbers

  const   totalItems  = numericData[0]; // First element is the count of items
  const   rawElements = numericData.slice(1, -1); // Extract the actual data elements

  const   sortedSequence  = countBasedOrder( rawElements ); // Perform the sorting operation

  const   centralPoint  = sortedSequence[totalItems / 2]; // Determine the median-like value from sorted data

  // Iterate through original elements and output based on comparison with central point
  for ( let currentIdx = 0; currentIdx < totalItems; currentIdx++ ) {
    if ( rawElements[currentIdx] < centralPoint ) {
      console.log( centralPoint ); // Output the central point if current element is smaller
    } else {
      console.log( sortedSequence[totalItems / 2 - 1] ); // Output the element just before the central point
    }
  }
}

// Read input from standard input and pass to the entry point
entryPoint(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);