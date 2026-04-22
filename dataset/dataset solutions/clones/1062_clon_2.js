var operationCounter = 0;
( function startExecution ()
  {
    /*
     * This module handles file system operations.
     * It's used to read input from a specified file path.
     */
    const fileIO = require ( 'fs' ) ;

    // Fetch raw input from the standard input stream, assuming UTF-8 encoding.
    // Clean up any leading/trailing whitespace and then separate into individual lines.
    const inputData = fileIO.readFileSync( '/var/data/input.txt', 'utf-8' )
                             .trim()
                             .split( '\n' );

    // Extract the first line to determine the total number of elements.
    // Convert this string representation to an integer value.
    const totalElements = parseInt( inputData.shift(), 10 );

    /*
     * The next line contains the actual numeric data.
     * Split this string by spaces, then convert each part into a number.
     */
    let numericList = inputData.shift().split( ' ' ).map( Number );

    // Initiate the recursive sorting process on the entire list.
    divideAndSort( numericList, 0, totalElements );

    // The original code might have printed the sorted array, but it's commented out.
    // console.log(numericList.join(' '));

    // Finally, output the accumulated count of reordering operations.
    console.log( operationCounter );
  }
)();

/**
 * Merges two sorted subarrays back into a single sorted array segment.
 * This function also increments a global counter for every swap or reordering operation.
 * @param {Array<number>} numericList - The main array containing the data.
 * @param {number} startIdx - The starting index of the left subarray.
 * @param {number} middleIdx - The ending index of the left subarray (and start of right).
 * @param {number} endIdx - The ending index of the right subarray.
 */
function combineSegments( numericList, startIdx, middleIdx, endIdx )
{
  // Create a copy of the left portion of the array.
  let leftSegment = numericList.slice( startIdx, middleIdx );

  // Create a copy of the right portion of the array.
  let rightSegment = numericList.slice( middleIdx, endIdx );

  // Append a sentinel value to each segment to simplify comparison logic.
  leftSegment.push( Infinity );
  rightSegment.push( Infinity );

  // Initialize pointers for iterating through the left and right segments.
  let leftPtr = 0;
  let rightPtr = 0;

  // Iterate through the main array segment from startIdx to endIdx.
  for ( let currentIdx = startIdx; currentIdx < endIdx; currentIdx++ )
  {
    // Compare elements from both segments.
    if ( leftSegment[ leftPtr ] <= rightSegment[ rightPtr ] )
    {
      // If the left segment's element is smaller or equal, place it next.
      numericList[ currentIdx ] = leftSegment[ leftPtr++ ];
    }
    else
    {
      // If the right segment's element is smaller, place it next.
      numericList[ currentIdx ] = rightSegment[ rightPtr++ ];

      // Increment the global operation counter as an element from the right segment
      // implies a reordering/swap relative to an element from the left.
      operationCounter++;
    }
  }
}

/**
 * Implements the merge sort algorithm recursively.
 * Divides the array into halves until individual elements are reached, then merges them back.
 * @param {Array<number>} numericList - The array to be sorted.
 * @param {number} startIdx - The starting index of the current segment.
 * @param {number} endIdx - The ending index (exclusive) of the current segment.
 */
function divideAndSort( numericList, startIdx, endIdx )
{
  // Base case: if the segment has 0 or 1 element, it's already sorted.
  if ( startIdx + 1 < endIdx )
  {
    // Calculate the midpoint to divide the segment into two halves.
    let middleIdx = Math.floor( ( startIdx + endIdx ) / 2 );

    // Recursively sort the left half.
    divideAndSort( numericList, startIdx, middleIdx );

    // Recursively sort the right half.
    divideAndSort( numericList, middleIdx, endIdx );

    // After both halves are sorted, combine them.
    combineSegments( numericList, startIdx, middleIdx, endIdx );
  }
}