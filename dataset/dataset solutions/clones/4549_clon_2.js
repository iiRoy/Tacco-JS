// This function processes an array of numerical values based on specific rules.
function ProcessInputData ( rawData ) {

  rawData = rawData.split ( "\n" ) ; // Split the entire input string by newline characters.

  const countOfElements = parseInt ( rawData[0].split ( " " )[0] ) ; // Extract the first configuration parameter.
  let primaryDecrement = parseInt ( rawData[0].split ( " " )[1] ) ; // Extract the second configuration parameter.
  let secondaryDecrement = parseInt ( rawData[0].split ( " " )[2] ) ; // Extract the third configuration parameter.

  let dataPoints = [ ] ; // Initialize an array to hold the processing data.
  let tempCounter = 0 ; // This variable is declared but not utilized in the original logic.

  // Populate the 'dataPoints' array with integer values from the input, starting from the second line.
  for ( let idx = 0 ; idx < countOfElements ; idx ++ ) {
    dataPoints[idx] = parseInt ( rawData[idx + 1] ) ;
  }

  let resultValue = 0 ; // Initialize the counter for processing iterations.

  // Continue processing as long as the maximum value in 'dataPoints' is non-negative.
  for ( let iterationCount = 0 ; Math.max.apply ( null, dataPoints ) >= 0 ; iterationCount ++ ) {

    // Find the index of the current maximum value within the 'dataPoints' array.
    const peakIndex = dataPoints.indexOf ( Math.max.apply ( null, dataPoints ) ) ;

    // Iterate through the 'dataPoints' array in reverse order to avoid issues with splice.
    for ( let reverseIdx = dataPoints.length - 1 ; reverseIdx >= 0 ; reverseIdx -- ) {
      if ( reverseIdx === peakIndex ) {
        // If the current element is the maximum, apply the primary decrement.
        dataPoints[reverseIdx] -= primaryDecrement ;
      } else {
        // Otherwise, apply the secondary decrement to other elements.
        dataPoints[reverseIdx] -= secondaryDecrement ;
        // If the element drops to zero or below, remove it from the array.
        if ( dataPoints[reverseIdx] <= 0 ) {
          dataPoints.splice ( reverseIdx, 1 ) ;
        }
      }
    }
    resultValue++ ; // Increment the iteration counter after each full pass.
  }

  // Output the final count of successful iterations.
  console.log ( '%s' , resultValue ) ;
}

// Read input from standard input using Node.js 'fs' module and pass it to the main processing function.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;