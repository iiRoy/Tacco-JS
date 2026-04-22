// This function processes the entire input text provided.
function PerformCalculation( incomingText )
{
  // Each line of input is separated into an array element.
  let textLines = incomingText.split( "\n" ) ;
  const elementCount = Number( textLines[0] ) ; // Convert the first line to an integer.
  let numericValues = textLines[1].split( " " ) ; // Split the second line into an array of strings.

  let accumulatedResult = 0 ; // Initialize a variable to store the sum of XOR operations.
  const moduloDivisor = 1000000007 ; // Define a constant for the modulo operation.

  // Iterate through the array to convert all string values to numbers.
  for ( let firstLoopIdx = 0 ; firstLoopIdx < elementCount ; firstLoopIdx++ )
  {
    numericValues[firstLoopIdx] = Number( numericValues[firstLoopIdx] ) ;
  }

  // Begin nested loops to calculate XOR sums for all unique pairs.
  for ( let firstLoopIdx = 0 ; firstLoopIdx < elementCount - 1 ; firstLoopIdx++ )
  {
    for ( let secondLoopIdx = firstLoopIdx + 1 ; secondLoopIdx < elementCount ; secondLoopIdx++ )
    {
      accumulatedResult += numericValues[firstLoopIdx] ^ numericValues[secondLoopIdx] ; // Add the bitwise XOR of two elements to the total.
    }
  }

  // Apply the modulo operation to the final sum.
  accumulatedResult = accumulatedResult % moduloDivisor ;
  console.log( accumulatedResult ) ; // Output the computed result to standard output.
}

// The following section should not be altered as it handles standard I/O.
PerformCalculation( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;