/* This module performs a specific calculation based on two numeric inputs.
 * It iterates through a nested loop structure to determine a final count. */
function AnalyzeInput( rawEntry )
{
  // Parse the incoming string data into an array of numbers.
  let numericDataSet = rawEntry . split ( ' ' ) . map ( strElement => Number ( strElement ) ) ;

  // Extract the primary upper bound and the required remainder threshold.
  const primaryLimit = numericDataSet [ 0 ] ;
  const remainderThreshold = numericDataSet [ 1 ] ;

  // Initialize a counter to accumulate matches.
  let matchAccumulator = 0 ;

  // Begin the outer iteration from 1 up to the primary limit.
  for ( let outerLoopVar = 1 ; outerLoopVar <= primaryLimit ; outerLoopVar++ )
  {
    // Start the inner iteration, also from 1 up to the primary limit.
    for ( let innerLoopVar = 1 ; innerLoopVar <= primaryLimit ; innerLoopVar++ )
    {
      // Check if the remainder of outerLoopVar divided by innerLoopVar meets the threshold.
      if ( ( outerLoopVar % innerLoopVar ) >= remainderThreshold )
      {
        // If the condition is met, increment the match counter.
        matchAccumulator ++ ;
      }
    }
  }

  // Output the final accumulated count to the console.
  console . log ( matchAccumulator ) ;
}

// Invoke the main analysis function by reading standard input.
AnalyzeInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf-8' ) ) ;