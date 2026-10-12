'use strict';

// Function to perform a binary search, finding the insertion point for 'targetValue'
// It returns the index 'k' such that all elements sourceArray[0...k-1] are <= targetValue
// and all elements sourceArray[k...] are > targetValue.
function searchIndex( sourceArray, targetValue ) {
  let leftPointer = -1; // Initialize left boundary (exclusive) for the search range.
  let rightPointer = sourceArray.length; // Initialize right boundary (exclusive) for the search range.

  // Continue searching while there's at least one element between the pointers.
  // The loop terminates when rightPointer - leftPointer is 1, meaning leftPointer and rightPointer
  // are adjacent indices, and the target position is found.
  while ( rightPointer - leftPointer > 1 ) {
    // Calculate the middle index, ensuring integer division.
    // This method prevents potential overflow issues with (leftPointer + rightPointer) / 2 for very large numbers,
    // though less critical in JavaScript than in some other languages.
    const midPoint = parseInt( leftPointer + ( rightPointer - leftPointer ) / 2, 10);

    // If the element at midPoint is strictly greater than the target value,
    // it means the target (or its insertion point) must be in the left half of the current range,
    // including midPoint itself as a potential new right boundary.
    if ( sourceArray[midPoint] > targetValue ) {
      rightPointer = midPoint; // Adjust the right boundary.
    } else {
      // Otherwise (if sourceArray[midPoint] <= targetValue), the target (or its insertion point)
      // must be in the right half of the current range, including midPoint itself as a potential new left boundary.
      leftPointer = midPoint; // Adjust the left boundary.
    }
  }
  // Upon loop termination, 'rightPointer' holds the smallest index 'k' such that sourceArray[k] > targetValue.
  // If all elements in sourceArray are less than or equal to targetValue, 'rightPointer' will be sourceArray.length.
  return rightPointer;
}

// Output the result of an immediately invoked function expression (IIFE).
// This structure encapsulates the main logic and processes the input.
console.log( ( function( inputData ) {
  // Process the raw input string:
  // 1. Trim leading/trailing whitespace.
  // 2. Split into an array of lines.
  // 3. For each line, split it by space and convert each resulting string to an integer.
  const parsedLines = inputData.trim().split('\n').map( ( rowString ) => {
    return rowString.split(' ').map( ( valStr ) => valStr | 0 ); // Using bitwise OR 0 for efficient integer conversion.
  } );

  // Extract the common size 'N' for arrays A, B, and C from the first line of input.
  const arraySize = parsedLines[0][0];
  // Extract array A from the second line of input.
  const arrayA = parsedLines[1];
  // Extract array B from the third line of input and sort it in ascending order.
  const arrayB = parsedLines[2].sort( ( val1, val2 ) => val1 - val2 );
  // Extract array C from the fourth line of input and sort it in ascending order.
  const arrayC = parsedLines[3].sort( ( val1, val2 ) => val1 - val2 );

  let totalTriplets = 0; // Initialize a counter to store the number of valid (a, b, c) triplets.

  // Iterate through each element in array A. This will be our 'a' value.
  for ( let idxA = 0; idxA < arraySize; idxA++ ) {
    // For the current A[idxA], find the starting index in array B where elements are strictly greater than A[idxA].
    // The 'searchIndex' function returns the count of elements in B that are less than or equal to A[idxA].
    // So, elements from 'bStartIndex' onwards in B are candidates for 'b' (i.e., B[idxB] > A[idxA]).
    let bStartIndex = searchIndex( arrayB, arrayA[idxA] );

    // Iterate through array B, starting from 'bStartIndex'. These are the 'b' elements
    // that satisfy the condition A[idxA] < B[idxB].
    for ( let idxB = bStartIndex; idxB < arraySize; idxB++ ) {
      // For each valid 'b' (arrayB[idxB]), find the count of elements in array C
      // that are strictly greater than arrayB[idxB].
      // 'searchIndex(arrayC, arrayB[idxB])' returns the count of elements in C that are less than or equal to B[idxB].
      // Subtracting this from 'arraySize' gives the count of elements in C that are strictly greater than B[idxB].
      totalTriplets += arraySize - searchIndex( arrayC, arrayB[idxB] );
    }
  }

  // Convert the final calculated count to a string before returning it.
  return totalTriplets.toString();
// Read input from standard input synchronously using Node.js 'fs' module
// and pass the UTF-8 encoded string to the IIFE.
} )( require('fs').readFileSync('/dev/stdin', 'utf8') ) );
