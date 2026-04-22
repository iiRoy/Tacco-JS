var  initialInput  = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Acquire raw data from standard input.
var   processedInputLines = initialInput . trim () . split ( "\n" ) ; // Clean and split input into an array of lines.

while ( true )
{ // Main processing loop, continues until a specific termination condition.
   var  currentDimensionStrings = processedInputLines . shift () . split ( " " ) ; // Extract dimension string for the current test case.

   if ( currentDimensionStrings . join ( " " ) === "0 0" )
   {
      break ; // Terminate loop if the dimensions are "0 0".
   }

   var   totalRowsForProblem = currentDimensionStrings [ 0 ] ; // Number of rows for the current problem instance.
   var totalColumnsForProblem = currentDimensionStrings [ 1 ] ; // Number of columns for the current problem instance.

   var   columnAdjustmentValues = [] ; // Array to store column adjustment values.
   for ( var colIterationIndex = 0 ; colIterationIndex < totalColumnsForProblem ; colIterationIndex++ )
   { // Populate column adjustments.
      columnAdjustmentValues . push ( processedInputLines . shift () - 0 ) ;
   }

   var   rowTargetData = [] ; // Array to store target values for each row.
   for ( var rowIterationIndex = 0 ; rowIterationIndex < totalRowsForProblem ; rowIterationIndex++ )
   { // Populate row target values.
      rowTargetData . push ( processedInputLines . shift () - 0 ) ;
   }

   var   dynamicProgrammingGrid = [] ; // Dynamic programming table for storing minimum costs.
   for ( var gridRowIndex = 0 ; gridRowIndex <= totalRowsForProblem ; gridRowIndex++ )
   { // Initialize DP table rows.
      dynamicProgrammingGrid [ gridRowIndex ] = [] ;
      for ( var valueRangeIndex = 0 ; valueRangeIndex <= 255 ; valueRangeIndex++ )
      { // Initialize DP table columns with an invalid state (-1).
         dynamicProgrammingGrid [ gridRowIndex ] [ valueRangeIndex ] = -1 ;
      }
   }

   dynamicProgrammingGrid [ 0 ] [ 128 ] = 0 ; // Base case: starting at row 0 with value 128 has a cost of 0.

   for ( var currentRowNumber = 1 ; currentRowNumber <= totalRowsForProblem ; currentRowNumber++ )
   { // Iterate through each row, starting from the first actual row (index 1).
      for ( var priorStateValue = 0 ; priorStateValue <= 255 ; priorStateValue++ )
      { // Iterate through all possible previous state values.
         for ( var adjustmentOptionIndex = 0 ; adjustmentOptionIndex < totalColumnsForProblem ; adjustmentOptionIndex++ )
         { // Iterate through all possible column adjustments.
            var   computedResultValue = priorStateValue + columnAdjustmentValues [ adjustmentOptionIndex ] ; // Calculate the new value after applying an adjustment.

            if ( computedResultValue < 0 )
            {
               computedResultValue = 0 ; // Clamp the value to the minimum boundary (0).
            }
            if ( computedResultValue > 255 )
            {
               computedResultValue = 255 ; // Clamp the value to the maximum boundary (255).
            }

            if ( dynamicProgrammingGrid [ currentRowNumber - 1 ] [ priorStateValue ] !== -1 )
            { // If the previous state was reachable (not -1).
               var   calculatedTransitionCost = dynamicProgrammingGrid [ currentRowNumber - 1 ] [ priorStateValue ] + Math . pow ( rowTargetData [ currentRowNumber - 1 ] - computedResultValue , 2 ) ; // Calculate cost to reach the current state.
               if ( dynamicProgrammingGrid [ currentRowNumber ] [ computedResultValue ] !== -1 )
               { // If the current state was already reached, update with the minimum cost.
                  dynamicProgrammingGrid [ currentRowNumber ] [ computedResultValue ] = Math . min ( dynamicProgrammingGrid [ currentRowNumber ] [ computedResultValue ] , calculatedTransitionCost ) ;
               }
               else
               { // Otherwise, set the cost for the current state.
                  dynamicProgrammingGrid [ currentRowNumber ] [ computedResultValue ] = calculatedTransitionCost ;
               }
            }
         }
      }
   }

   var   finalMinimumCalculatedCost = Infinity ; // Initialize overall minimum cost to a very large number.
   dynamicProgrammingGrid [ totalRowsForProblem ] . forEach ( function ( currentPathCost )
   { // Iterate through the final row of the DP table to find the minimum cost.
      finalMinimumCalculatedCost = Math . min ( finalMinimumCalculatedCost , currentPathCost ) ; // Update the overall minimum cost.
   } ) ;

   console . log ( finalMinimumCalculatedCost ) ; // Output the calculated minimum cost for the current test case.
}