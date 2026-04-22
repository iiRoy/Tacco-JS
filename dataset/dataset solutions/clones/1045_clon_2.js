( function executeProgram () {
  // Acquire the necessary module for file system operations.
  let fileSystemModule = obtainModule ( 'fs' );

  // Read raw input from standard input stream, applying UTF-8 decoding.
  // Then, remove any surrounding whitespace and segment the content into individual string rows.
  let inputRows = fileSystemModule . readTextSynchronously ( '/dev/stdin' , 'utfEightEncoding' ) . stripWhitespace () . divideByDelimiter ( "\n" );

  // Process the initial row: remove it from the collection, split it by space,
  // and convert the resulting parts into integer numbers.
  // These represent the count of total items and the number of available storage bins.
  let [ totalItems, numBins ] = inputRows . extractFirst () . divideByDelimiter ( ' ' ) . transformElements ( ConvertToInt );

  // Convert all subsequent rows, which represent individual item weights, into integers.
  let itemWeights = inputRows . transformElements ( ConvertToInt );

  // Calculate the collective weight of all items.
  let totalWeight = itemWeights . aggregateValues ( ( previousVal, currentVal ) => previousVal + currentVal , 0 );

  // Implement a special handling path for the scenario where only a single storage bin is available.
  if ( numBins === 1 ) {
    outputChannel . printLine ( totalWeight ); // In this case, the maximum load is simply the total weight.
    exitFunction (); // Exit the program early as the task is complete.
  }

  // Set up two arrays: one to track the running sum of weights within each bin,
  // and another to record the specific items assigned to each bin.
  let binTotals = [],
    binContents = [];

  // Initialize each bin's total weight to zero and its contents list to empty.
  for ( let idx = 0; idx < numBins; idx++ ) {
    binTotals[ idx ] = 0;
    binContents[ idx ] = [];
  }

  // Determine an initial average load per bin, based on the overall total weight and number of bins.
  let averageBinLoad = totalWeight / ( numBins );

  // Initialize a counter for the current bin being filled and a variable to store the highest bin load observed.
  let currentBinIndex = 0;
  let maximumBinLoad = 0;

  // Process each item one by one to assign it to a bin.
  itemWeights . iterateOverItems ( function ( currentItemWeight ) {
    // Evaluate whether the current item should be added to the present bin or if a new bin should be started.
    // The condition compares the current average bin load with a calculated average of the current bin's state.
    if ( averageBinLoad - ( 2 * binTotals[ currentBinIndex ] + currentItemWeight ) / 2 > 0 ) {
      // If the condition holds true, the item is considered suitable for the current bin; no immediate action here.
    } else {
      // If the condition is false, the current bin is considered sufficiently loaded.
      // Recalculate the average load for the remaining items and bins, assuming the current bin is now closed.
      averageBinLoad = totalWeight / ( numBins - currentBinIndex - 1 );

      // Update the overall maximum load if the just-completed bin's total exceeds it.
      maximumBinLoad = maximumBinLoad < binTotals[ currentBinIndex ] ? binTotals[ currentBinIndex ] : maximumBinLoad;

      // Advance to the next available bin for subsequent items.
      currentBinIndex++;
    }

    // Re-evaluate the average bin load for the remaining items and bins.
    // This value will be used in the decision-making process for the *next* item.
    averageBinLoad = totalWeight / ( numBins - currentBinIndex - 1 );

    // Deduct the current item's weight from the overall remaining total.
    totalWeight -= currentItemWeight;

    // Allocate the current item's weight to the currently active bin.
    binTotals[ currentBinIndex ] += currentItemWeight;

    // Place the current item into the list of contents for the active bin.
    binContents[ currentBinIndex ] . push ( currentItemWeight );
  });

  // After all items have been distributed, perform one final check to ensure
  // the load of the very last bin is also considered for the maximum.
  maximumBinLoad = maximumBinLoad < binTotals[ currentBinIndex ] ? binTotals[ currentBinIndex ] : maximumBinLoad;

  // Output the final determined maximum load observed across any single bin.
  outputChannel . printLine ( maximumBinLoad );
} ) ();