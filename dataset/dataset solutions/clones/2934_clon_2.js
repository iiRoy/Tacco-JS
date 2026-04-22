"use strict"; /* Enable strict mode for cleaner code */

// Main function to process the provided raw input string
function processInput ( rawData ) {
  // Split the input string into an array of lines based on newline character
  const linesOfData = rawData.split ( "\n" ) ;

  // Process the first line to get initial configuration parts
  const firstLineParts = linesOfData [0] .split ( " " ) ;

  // Process the second line to get initial range parts
  const secondLineParts = linesOfData [1] .split ( " " ) ;

  // Parse the first number from the first line (e.g., total number of entities)
  const numEntities = parseInt ( firstLineParts [0] ) ;
  // Parse the second number from the first line (e.g., total number of restrictions)
  const totalRestrictions = parseInt ( firstLineParts [1] ) ;

  // Declare variables to hold parts of the current restriction
  let currentRangeParts ;
  let currentLowerBound ;
  let currentUpperBound ;

  // Initialize the overall valid lower and upper limits based on the second line
  let overallLowerLimit = parseInt ( secondLineParts [0] ) ;
  let overallUpperLimit = parseInt ( secondLineParts [1] ) ;

  // Loop through all specified restrictions starting from the third line
  for ( let constraintIndex = 2 ; constraintIndex <= totalRestrictions ; constraintIndex ++ ) {
    // Split the current restriction line into its components
    currentRangeParts = linesOfData [constraintIndex] .split ( " " ) ;
    // Parse the lower bound of the current restriction
    currentLowerBound = parseInt ( currentRangeParts [0] ) ;
    // Parse the upper bound of the current restriction
    currentUpperBound = parseInt ( currentRangeParts [1] ) ;

    /*
     * Check for non-overlapping ranges.
     * If the current range is completely outside the overall valid range,
     * then there is no common intersection.
     */
    if ( overallUpperLimit < currentLowerBound || currentUpperBound < overallLowerLimit ) {
      overallLowerLimit = 0 ; // Reset lower limit to indicate no intersection
      overallUpperLimit = -1 ; // Reset upper limit to indicate no intersection (max < min)
      break ; // Exit the loop as no intersection is possible
    }

    // Update the overall lower limit if the current restriction's lower bound is greater
    if ( overallLowerLimit < currentLowerBound ) {
      overallLowerLimit = currentLowerBound ;
    }
    // Update the overall upper limit if the current restriction's upper bound is smaller
    if ( currentUpperBound < overallUpperLimit ) {
      overallUpperLimit = currentUpperBound ;
    }
  }
  // Calculate and print the length of the final common intersection range
  console .log ( overallUpperLimit - overallLowerLimit + 1 ) ;
}

// Execute the processing function with input read from standard input
processInput (
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;