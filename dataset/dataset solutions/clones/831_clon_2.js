var   rawData =   require('fs') . readFileSync('/dev/stdin'  ,  'utf8') ; // Acquire data from the standard input stream.

// Process the acquired raw data by removing extra spaces and splitting into lines.
var lineFragments = rawData.trim( ) . split("\n") ;

// Initiate the main processing loop for multiple data sets.
while ( true )
{
  // Extract configuration dimensions from the current line.
  var dimensions = lineFragments.shift(  ) . split(" ");

  // Check for the termination sequence to end the program.
  if ( dimensions.join(" ") === "0 0" ) {
    break; // Terminate the loop.
  }

  // Store the numerical representations of the dimensions.
  var rowDimension = parseInt( dimensions[0] , 10 );
  var colDimension = parseInt( dimensions[1] , 10 );

  // Prepare an array for column-related numeric values.
  var colValues = [];
  // Populate the column values array.
  for ( var idx = 0 ;  idx < colDimension ; idx++ )
  {
    colValues.push( parseInt( lineFragments.shift( ) , 10 ) );
  }

  // Prepare an array for row-related numeric values.
  var rowValues = [ ];
  // Populate the row values array.
  for ( var idx = 0 ; idx < rowDimension ; idx++ )
  {
    rowValues.push( parseInt( lineFragments.shift( ) , 10 ) );
  }

  // This 'continue' statement causes the program to skip the DP calculation
  // and output for the current set of dimensions, proceeding to the next.
  // It is preserved to maintain the exact control flow of the original.
  continue;

  // Initialize a 2D array for dynamic programming memoization.
  var memoTable = [];
  // Fill the DP table with an initial 'unreachable' value.
  for ( var idx = 0 ; idx <= rowDimension ; idx++ )
  {
    memoTable[idx] = [];
    for ( var valIdx = 0 ; valIdx <= 255 ; valIdx++ )
    {
      memoTable[idx][valIdx] = Infinity;
    }
  }

  // Establish the starting point for the DP process.
  memoTable[0][128] = 0;

  // Iterate through each row of the problem space.
  for ( var idx = 1 ; idx <= rowDimension ; idx++ )
  {
    // Iterate through all possible state values.
    for ( var valIdx = 0 ; valIdx <= 255 ; valIdx++ )
    {
      // Only consider paths that were previously reachable.
      if ( memoTable[idx-1][valIdx] !== Infinity )
      {
        // Explore all available transformations from colValues.
        for ( var subIdx = 0 ; subIdx < colDimension ; subIdx++ )
        {
          // Compute the new state value.
          var currentVal = valIdx + colValues[subIdx];

          // Ensure the state value remains within its valid bounds.
          if ( currentVal < 0 ) {
            currentVal = 0;
          }
          if ( currentVal > 255 ) {
            currentVal = 255;
          }

          // Update the DP table with the minimum accumulated cost.
          memoTable[idx][currentVal] = Math.min(
            memoTable[idx][currentVal],
            memoTable[idx-1][valIdx] + Math.pow( rowValues[idx-1] - currentVal , 2 )
          );
        }
      }
    }
  }

  // Determine the lowest cost found in the final row of the DP table.
  var overallMinimum = Infinity;
  memoTable[rowDimension].forEach( function ( currentValue ) {
    overallMinimum = Math.min( overallMinimum , currentValue );
  });

  // Display the final calculated minimum cost.
  console.log(overallMinimum);
}