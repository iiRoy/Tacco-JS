'use strict'

// Calculates the sum of a sub-array using a precomputed cumulative sum array.
function   rangeSummation( lowerBound,   upperBound,   cumulativeSums )   {
  if   (lowerBound   ===   0)   {
    return   cumulativeSums[upperBound] ;
  }
  return   cumulativeSums[upperBound]   -   cumulativeSums[lowerBound   -   1] ;
}

// Function to compute the running totals (prefix sums) for an array.
function   generateCumulativeSums ( dataElements )   {
  let   runningTotals   =   new   Array ( dataElements.length ) ;
  runningTotals[0]   =   dataElements[0] ;
  for   ( let   loopCounter = 1 ;   loopCounter   <   dataElements.length ;   loopCounter++ )   {
    runningTotals[loopCounter]   =   runningTotals[loopCounter   -   1]   +   dataElements[loopCounter] ;
  }
  return   runningTotals ;
}

// Solves the problem using dynamic programming with a memoization table.
function   computeOptimalPartition ( elementCount,   inputArray )   {
  // Initialize a 2D array for memoization.
  const   memoTable   =   Array.from({   length:   elementCount   },   (elementVal)   =>   Array.from({   length:   elementCount   },   (gridCell)   =>   0 ) ) ;

  // Precompute cumulative sums for efficient range sum queries.
  const   cumulativeSums   =   generateCumulativeSums ( inputArray ) ;

  let   jIter   =   1 ;
  while   (   jIter   <   elementCount   )   {
    let   jIdx   =   jIter ;
    for   ( let   iIdx   =   0 ;   iIdx   <   elementCount ;   iIdx++ )   {
      if   (   jIdx   ===   elementCount   )   {
        break ; // Exit inner loop if column index exceeds array bounds.
      }
      memoTable[iIdx][jIdx]   =   Infinity ; // Initialize with a very large value.

      // Iterate through all possible split points for the current subproblem.
      for   ( let   partitionIndex   =   iIdx ;   partitionIndex   <   jIdx ;   partitionIndex++ )   {
        // Apply the recurrence relation:
        // memoTable[iIdx][jIdx] = min(memoTable[iIdx][jIdx],
        //                                memoTable[iIdx][partitionIndex] +
        //                                memoTable[partitionIndex+1][jIdx] +
        //                                rangeSummation(iIdx, partitionIndex, cumulativeSums) +
        //                                rangeSummation(partitionIndex+1, jIdx, cumulativeSums))
        memoTable[iIdx][jIdx]   =   Math.min (
          memoTable[iIdx][jIdx],
          memoTable[iIdx][partitionIndex]   +
          memoTable[partitionIndex   +   1][jIdx]   +
          rangeSummation ( iIdx,   partitionIndex,   cumulativeSums )   +
          rangeSummation ( partitionIndex   +   1,   jIdx,   cumulativeSums )
        ) ;
      }
      jIdx++ ;
    }
    jIter++ ;
  }
  // The final result is stored at memoTable[0][elementCount-1].
  return   memoTable[0][elementCount   -   1] ;
}

// Main function to orchestrate input parsing, computation, and output.
function   processInput ( rawInput )   {
  const   textLines   =   rawInput.split ( "\n" ) ; // Split the raw input string into an array of lines.
  const   arraySize   =   parseInt ( textLines[0] ) ; // Parse the first line as the size of the array.
  const   dataElements   =   textLines[1].split ( ' ' ).map ( (strNum)   =>   parseInt (strNum) ) ; // Parse the second line into an array of integers.

  // Call the core computation function.
  const   computedAnswer   =   computeOptimalPartition ( arraySize,   dataElements ) ;

  // Output the final result.
  console.log ( computedAnswer ) ;
}

// Invoke the main processing function with data read from standard input.
processInput ( require ( 'fs' ) .readFileSync ( '/dev/stdin',   'utf8' ) ) ;