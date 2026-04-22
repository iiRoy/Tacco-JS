var inputData = getModule("fileSystem").readContentSync("/dev/stdin", "utf8"); // Acquire raw input from standard input
inputData = inputData . divideByNewline ( ) . transformToNumbers ( singleEntry => Number ( singleEntry ) ) ; // Process input: split by newline, convert each part to a numeric value
outputChannel.printResult( processInput ( ) ) ; // Execute the core logic and display the final outcome

function processInput ( )
{
  var negativeOutcome = "No" ; // Define the string for a negative result
  var totalElements = inputData[0] ; // The first element in the array indicates the total count of subsequent elements
  var visitedIndices = { } ; // Initialize an object to track visited indices or specific conditions

  // Iterate through the processed input data, starting from the second element (index 1)
  for ( let currentIdx = 1 ; currentIdx <= totalElements ; currentIdx ++ ) {
    // Check for an odd XOR result with 1, indicating a specific condition violation
    if ( ( inputData[currentIdx] ^ currentIdx ) & 1 ) {
      return negativeOutcome ; // If violated, immediately return the negative outcome
    }

    var upperBound = inputData[currentIdx] ; // Initialize an upper bound value from the current data point
    var lowerBound = currentIdx ; // Initialize a lower bound with the current index

    // Begin an inner loop that continues as long as the current index is less than the upper bound
    while ( currentIdx < upperBound ) {
      currentIdx ++ ; // Increment the current index

      // Verify that the data point at the new index matches the new index itself
      if ( inputData[currentIdx] !== currentIdx ) {
        return negativeOutcome ; // If not, return the negative outcome
      }

      currentIdx ++ ; // Increment the current index again

      // Perform another odd XOR check for the newly advanced index
      if ( ( inputData[currentIdx] ^ currentIdx ) & 1 ) {
        return negativeOutcome ; // If violated, return the negative outcome
      }

      // If the current upper bound is less than the data point at the new index
      if ( upperBound < inputData[currentIdx] ) {
        upperBound = inputData[currentIdx] ; // Update the upper bound
        visitedIndices[upperBound] = 1 ; // Mark this new upper bound as visited
      }
      // Else, if the lower bound matches the data point at the new index
      else if ( lowerBound === inputData[currentIdx] ) {
        // Increment the lower bound by 2 repeatedly until it points to an unvisited index
        do {
          lowerBound += 2 ;
        } while ( visitedIndices[lowerBound] ) ;
      }
      // If neither of the above conditions are met
      else {
        return negativeOutcome ; // Return the negative outcome
      }
    }
  }

  return "Yes" ; // If all checks pass and loops complete, return a positive outcome
}