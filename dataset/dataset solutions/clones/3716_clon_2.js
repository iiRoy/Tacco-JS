// This primary function handles the entire data processing workflow.
function ProcessInput( inputStr )
{
  // First, split the incoming string data into individual lines.
  let linesArray = inputStr.split( "\n" );

  // Extract the main numeric count from the first line and adjust it.
  const countVal = Number( linesArray[0] ) - 1;

  // Convert the second line of input into an array of numerical values.
  const dataArr = linesArray[1].split( " " ).map( val => Number( val ) );

  // Initialize an array that will store the running prefix sums of 'dataArr'.
  let prefixSums = [];

  // Populate the 'prefixSums' array using a reduce operation.
  // The element at 'countVal' will ultimately store the total sum of 'dataArr'.
  prefixSums[countVal] = dataArr.reduce( ( currentAccumulator, currentElement, elementIndex ) => {
    prefixSums[elementIndex - 1] = currentAccumulator; // Store sum up to previous element
    return currentAccumulator + currentElement;         // Accumulate for next iteration
  } );

  // Set an initial maximum possible value for tracking the minimum difference.
  let minDiff = 9_000_000_000_000_000; // Represents 9e15, a very large number

  // Iterate through potential split points within the data array.
  // The loop considers indices from 1 up to 'countVal - 2'.
  for ( let splitIdx = 1; splitIdx < countVal - 1; splitIdx++ )
  {
    // Calculate the target sums for the left and right sub-arrays,
    // effectively finding the ceiling of half their respective sums.
    const targetLeftSum = ( prefixSums[splitIdx] + 1 ) >>> 1;
    const targetRightSum = ( prefixSums[countVal] + prefixSums[splitIdx] + 1 ) >>> 1;

    // Use a binary search helper to find the appropriate division points
    // for the left and right segments of the array based on target sums.
    let leftBoundIdx = findLowerBound( prefixSums, 0, splitIdx - 1, targetLeftSum );
    let rightBoundIdx = findLowerBound( prefixSums, splitIdx + 1, countVal - 1, targetRightSum );

    // Compute the sums of the four conceptual partitions based on the current split points.
    let partSums = [
      prefixSums[leftBoundIdx],                               // First partition sum
      prefixSums[splitIdx] - prefixSums[leftBoundIdx],        // Second partition sum
      prefixSums[rightBoundIdx] - prefixSums[splitIdx],       // Third partition sum
      prefixSums[countVal] - prefixSums[rightBoundIdx]        // Fourth partition sum
    ];

    // Sort the calculated partition sums to easily identify the minimum and maximum.
    partSums.sort( ( valA, valB ) => valA - valB );

    // Update the overall minimum difference if the current (max - min) range is smaller.
    minDiff = Math.min( minDiff, partSums[3] - partSums[0] );

    // Explore an alternative split for the first partition by shifting 'leftBoundIdx' one position left.
    if ( leftBoundIdx > 0 )
    {
      partSums = [
        prefixSums[leftBoundIdx - 1],
        prefixSums[splitIdx] - prefixSums[leftBoundIdx - 1],
        prefixSums[rightBoundIdx] - prefixSums[splitIdx],
        prefixSums[countVal] - prefixSums[rightBoundIdx]
      ];
      partSums.sort( ( valA, valB ) => valA - valB );
      minDiff = Math.min( minDiff, partSums[3] - partSums[0] );

      // If there's sufficient space, also explore shifting 'rightBoundIdx' one position left simultaneously.
      if ( rightBoundIdx - splitIdx > 1 )
      {
        partSums = [
          prefixSums[leftBoundIdx - 1],
          prefixSums[splitIdx] - prefixSums[leftBoundIdx - 1],
          prefixSums[rightBoundIdx - 1] - prefixSums[splitIdx],
          prefixSums[countVal] - prefixSums[rightBoundIdx - 1]
        ];
        partSums.sort( ( valA, valB ) => valA - valB );
        minDiff = Math.min( minDiff, partSums[3] - partSums[0] );
      }
    }

    // Separately, explore an alternative split for the third partition by shifting 'rightBoundIdx' one position left.
    // This check ensures it's only done if there's enough space and it hasn't been covered above.
    if ( rightBoundIdx - splitIdx > 1 )
    {
      partSums = [
        prefixSums[leftBoundIdx],
        prefixSums[splitIdx] - prefixSums[leftBoundIdx],
        prefixSums[rightBoundIdx - 1] - prefixSums[splitIdx],
        prefixSums[countVal] - prefixSums[rightBoundIdx - 1]
      ];
      partSums.sort( ( valA, valB ) => valA - valB );
      minDiff = Math.min( minDiff, partSums[3] - partSums[0] );
    }
  }

  // Print the smallest difference found across all configurations.
  console.log( minDiff );
}

// This helper function performs a binary search to find the "lower bound"
// of a target value within a specified range of an array.
// It returns the index of the first element that is greater than or equal to 'targetVal'.
function findLowerBound( searchArr, startIndex, endIndex, targetVal )
{
  // Continue the binary search as long as the search range contains more than one element.
  for ( let midIndex; 1 < endIndex - startIndex; )
  {
    // Calculate the middle index, ensuring it's an integer.
    midIndex = 0 | ( startIndex + endIndex ) / 2;

    // If the element at the middle index is less than the target,
    // narrow the search to the right half.
    if ( searchArr[midIndex] < targetVal )
    {
      startIndex = midIndex;
    }
    // Otherwise, narrow the search to the left half (including the middle element).
    else
    {
      endIndex = midIndex;
    }
  }
  // After the loop, 'startIndex' and 'endIndex' will be adjacent or equal.
  // Determine which of the two is the correct lower bound.
  return searchArr[startIndex] < targetVal ? endIndex : startIndex;
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );