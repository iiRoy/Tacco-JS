function processInputData(rawDataString) {
  // Declare all necessary operational variables
  let outerLoopIndex;
  let innerLoopCounter;
  let dataMatrix;
  let finalSum = 0.0; /* Initialize accumulator as a float */

  // Parse initial configuration parameters from the first line of input
  const parsedDimensions = rawDataString.split("\n")[0].split(" ");

  // Initialize the primary data structure with a specific size
  dataMatrix = new Array( parseInt(parsedDimensions[1]) );

  // Populate the data structure from subsequent lines of input
  for ( outerLoopIndex = 0 ; outerLoopIndex < parseInt(parsedDimensions[0]) ; outerLoopIndex++ )
  {
    dataMatrix[outerLoopIndex] = rawDataString.split("\n")[outerLoopIndex + 1].split(" ");
  }

  // Sort the data matrix based on the first element of each sub-array
  dataMatrix.sort( ( elemA, elemB ) => {
    return ( parseFloat(elemA[0]) - parseFloat(elemB[0]) );
  } );

  // Reset loop indices for the main processing phase
  outerLoopIndex = 0;
  innerLoopCounter = 0;

  // Main processing loop: iterate until innerLoopCounter reaches a threshold
  while ( innerLoopCounter < parseInt(parsedDimensions[1]) )
  {
    // Add the numerical value of the current item's first element to the total
    finalSum += parseFloat(dataMatrix[outerLoopIndex][0]);

    // Decrement the second element of the current item
    dataMatrix[outerLoopIndex][1]--;

    // Increment the inner loop counter
    innerLoopCounter++;

    // If the second element of the current item falls to zero or below,
    // move to the next item in the data matrix
    if ( dataMatrix[outerLoopIndex][1] <= 0 )
    {
      outerLoopIndex++;
    }
  }

  // Output the computed final sum to the console
  console.log(finalSum);
}

// Invoke the primary function with data read from standard input
processInputData (
  require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' )
);