// This function computes the minimal penalty for reaching target values through recursive exploration.
function calculatePenaltyScore( currentLevel ,  totalSegments ,  targetGoals ,  currentSums ,  segmentLengths )
{
  // A commented-out debug line, useful for tracing recursion.
  // console.log( [ currentLevel, totalSegments, targetGoals, currentSums, segmentLengths ] ) ;

  // Base condition: If the current recursion level equals the total number of segments,
  // we have processed all available segments. Calculate the absolute sum of differences
  // between the accumulated quantities and the desired target quantities.
  if ( currentLevel === totalSegments )
  {
    // Another commented-out debug line for the base case return value.
    // console.log( Math.abs( targetGoals[0] - currentSums[0] ) + Math.abs( targetGoals[1] - currentSums[1] ) + Math.abs( targetGoals[2] - currentSums[2] ) ) ;
    return Math.abs( targetGoals[ 0 ] - currentSums[ 0 ] ) + Math.abs( targetGoals[ 1 ] - currentSums[ 1 ] ) + Math.abs( targetGoals[ 2 ] - currentSums[ 2 ] ) ;
  }

  // Option A: Skip the current segment entirely. Proceed to the next level without modifying current sums.
  const outcomeA = calculatePenaltyScore( currentLevel + 1 , totalSegments , targetGoals , currentSums , segmentLengths ) ;

  // Option B: Use the current segment to augment the first component of the current sums, incurring a fixed penalty.
  const outcomeB = calculatePenaltyScore( currentLevel + 1 , totalSegments , targetGoals , [ currentSums[ 0 ] + segmentLengths[ currentLevel ] , currentSums[ 1 ] , currentSums[ 2 ] ] , segmentLengths ) + 10 ;

  // Option C: Use the current segment to augment the second component of the current sums, incurring a fixed penalty.
  const outcomeC = calculatePenaltyScore( currentLevel + 1 , totalSegments , targetGoals , [ currentSums[ 0 ] , currentSums[ 1 ] + segmentLengths[ currentLevel ] , currentSums[ 2 ] ] , segmentLengths ) + 10 ;

  // Option D: Use the current segment to augment the third component of the current sums, incurring a fixed penalty.
  const outcomeD = calculatePenaltyScore( currentLevel + 1 , totalSegments , targetGoals , [ currentSums[ 0 ] , currentSums[ 1 ] , currentSums[ 2 ] + segmentLengths[ currentLevel ] ] , segmentLengths ) + 10 ;

  // Return the smallest penalty identified across all four possible paths.
  return Math.min( outcomeA , outcomeB , outcomeC , outcomeD ) ;
}

// Primary entry point for processing the input data and initiating the calculation.
function processInputData( rawDataContent )
{
  // Split the raw input string into an array of individual lines.
  const inputLines = rawDataContent.split( '\n' ) ;

  // Parse the first line to extract the total number of elements.
  const totalCount = inputLines[ 0 ].split( ' ' ).map( ( element ) => parseInt( element ) )[ 0 ] ;

  // Extract the three target quantities from the first line.
  const targetQuantityA = inputLines[ 0 ].split( ' ' ).map( ( element ) => parseInt( element ) )[ 1 ] ;
  const targetQuantityB = inputLines[ 0 ].split( ' ' ).map( ( element ) => parseInt( element ) )[ 2 ] ;
  const targetQuantityC = inputLines[ 0 ].split( ' ' ).map( ( element ) => parseInt( element ) )[ 3 ] ;

  // Convert all lines to integers to form the list of segment lengths.
  // Using 'let' as this array will be modified by the 'shift' operation.
  let dimensionSegments = inputLines . map( ( lineItem ) => parseInt( lineItem ) ) ;

  // Remove the first element (which was the totalCount) from the list of segments,
  // as it is not an actual segment length.
  dimensionSegments . shift( ) ;

  // Invoke the recursive calculation function to determine the minimum penalty.
  // Start with level 0, all current sums at 0, and the extracted target and segment data.
  const finalCalculatedScore = calculatePenaltyScore( 0 , totalCount , [ targetQuantityA , targetQuantityB , targetQuantityC ] , [ 0 , 0 , 0 ] , dimensionSegments ) ;

  // Output the adjusted final score to the console. The adjustment subtracts a base penalty.
  console.log( finalCalculatedScore - 30 ) ;
}

// Execute the main processing function by reading input from standard input.
processInputData( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;