/*
 * This module processes numerical inputs from standard input
 * to find the minimum sum of three non-negative integers (x, y, z)
 * such that x + y*y + z*z*z equals the input value.
 *
 * Author: CodeCloneGen
 * Date: 2023-10-27
 */

var fileSystemModule = require ( 'fs' ) ,
    stdInFileDescriptor = process . stdin . fd ,
    // Determine the total expected data size from the standard input stream.
    incomingDataSize = fileSystemModule . fstatSync ( stdInFileDescriptor ) . size ,
    // Allocate a byte array to hold the incoming raw binary data.
    rawInputBytes = new Uint8Array ( incomingDataSize ) ,
    // Read the data from stdin into our byte array.
    actualBytesReceived = fileSystemModule . readSync ( stdInFileDescriptor , rawInputBytes , 0 , incomingDataSize , 0 ) ,
    // Convert the received bytes into a UTF-8 string, then split into individual lines.
    parsedInputLines = new TextDecoder ( 'utf-8' ) . decode ( rawInputBytes . slice ( 0 , actualBytesReceived ) ) . split ( '\n' ) ;

// Placeholder variables for the main loop.
var currentNumericInputVal, overallComputationResult;

// Function definition for the core calculation logic.
function calculateMinimalComponentSum ( targetSumValue ) {
  // Initialize the minimum sum found so far to an extremely large value.
  var localMinimalSum = Number.POSITIVE_INFINITY ;

  // Iterate for the cubic component (z).
  // The loop continues as long as z^3 does not exceed the target value.
  for ( var cubicComponent = 0 ; cubicComponent * cubicComponent * cubicComponent <= targetSumValue ; cubicComponent ++ )
  {
    // Iterate for the square component (y).
    // The loop ensures y^2 does not exceed the remaining value after subtracting z^3.
    for ( var squareComponent = 0 ; squareComponent * squareComponent <= targetSumValue - cubicComponent * cubicComponent * cubicComponent ; squareComponent += 1 )
    {
      // Calculate the linear component (x) required to reach the target sum.
      var linearComponent = targetSumValue - cubicComponent * cubicComponent * cubicComponent - squareComponent * squareComponent ;

      // Check if the sum of current x, y, and z components is less than the current minimum.
      if ( localMinimalSum > linearComponent + cubicComponent + squareComponent )
      {
        // Update the minimum sum if a smaller combination is found.
        localMinimalSum = linearComponent + squareComponent + cubicComponent ;
      }
    }
  }
  // Return the smallest sum of x+y+z that satisfies the condition.
  return localMinimalSum ;
}

// Main processing loop: reads input values one by one until a zero is encountered.
while ( ( currentNumericInputVal = + parsedInputLines . shift ( ) ) !== 0 ) {
  // Compute the result for the current input and print it to standard output.
  console . info ( calculateMinimalComponentSum ( currentNumericInputVal ) ) ;
}