let operationCounter = 0;

const partitionAndCombine = ( numericalCollection, beginPos, finalPos ) => {
  // Check if the current segment has more than one element.
  if ( beginPos + 1 < finalPos )
  {
    // Calculate the midpoint to divide the segment into two.
    const splitIdx = Math.floor( ( beginPos + finalPos ) / 2 );

    // Recursively sort the left part of the segment.
    partitionAndCombine( numericalCollection, beginPos, splitIdx );

    // Recursively sort the right part of the segment.
    partitionAndCombine( numericalCollection, splitIdx, finalPos );

    // After both halves are sorted, merge them back together.
    uniteSegments( numericalCollection, beginPos, splitIdx, finalPos );
  }
};

const uniteSegments = ( numericalCollection, beginPos, splitIdx, finalPos ) => {
  // Determine the size of the first (left) sub-array.
  const segmentOneLength = splitIdx - beginPos;
  // Determine the size of the second (right) sub-array.
  const segmentTwoLength = finalPos - splitIdx;

  // Create a temporary buffer for the left sub-array.
  const firstBuffer = new Array( segmentOneLength );
  for ( let leftPtr = 0; leftPtr < segmentOneLength; ++leftPtr ) {
    firstBuffer[leftPtr] = numericalCollection[beginPos + leftPtr];
  }
  // Add a very large sentinel value to simplify comparison logic.
  firstBuffer[segmentOneLength] = 2000000000;

  // Create a temporary buffer for the right sub-array.
  const secondBuffer = new Array( segmentTwoLength );
  for ( let rightPtr = 0; rightPtr < segmentTwoLength; ++rightPtr ) {
    secondBuffer[rightPtr] = numericalCollection[splitIdx + rightPtr];
  }
  // Add a very large sentinel value to simplify comparison logic.
  secondBuffer[segmentTwoLength] = 2000000000;

  // Initialize pointers for iterating through the temporary buffers.
  let leftPtr = 0;
  let rightPtr = 0;

  // Merge the two sorted buffers back into the original collection.
  for ( let writePtr = beginPos; writePtr < finalPos; writePtr++ ) {
    // Increment the global counter for each element comparison.
    operationCounter++;
    if ( firstBuffer[leftPtr] < secondBuffer[rightPtr] ) {
      numericalCollection[writePtr] = firstBuffer[leftPtr];
      leftPtr++;
    } else {
      numericalCollection[writePtr] = secondBuffer[rightPtr];
      rightPtr++;
    }
  }
};

const solutionEngine = ( elementCount, numericalCollection ) => {
  // Start the merge sort process from the beginning to the end of the array.
  partitionAndCombine( numericalCollection, 0, elementCount );
  return numericalCollection;
};

// Variables to manage the input reading process.
let processedLines = 0;
let elementCount = 0;

// Set up the readline interface to handle standard input.
const streamReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Event listener for each line of input received.
streamReader.on("line", (dataString) => {
  processedLines++; // Increment the counter for lines processed.

  if (processedLines === 1) {
    // The first line contains the total number of elements.
    elementCount = Number(dataString.trim());
  } else {
    // The second line contains the space-separated numbers to sort.
    const collectionToBeSorted = dataString.trim().split(" ").map(element => Number(element));

    // Call the sorting engine to process the collection.
    const sortedCollection = solutionEngine(elementCount, collectionToBeSorted);

    // Print the sorted elements, joined by spaces.
    console.log(sortedCollection.reduce((outputString, element) => `${outputString} ${element}`));

    // Print the total number of operations performed during sorting.
    console.log(operationCounter);

    // Terminate the process after outputting results.
    process.exit(0);
  }
});