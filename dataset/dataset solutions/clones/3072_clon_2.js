'use strict'
function  primaryProcess ( incomingText )
{
  // Parse the input string into an array of numbers
  const numericValuesArray = incomingText . split ( "\n" ) . map ( Number ) ;

  // Remove the last empty element often resulting from split
  numericValuesArray.pop  ( ) ;

  // Extract the first number as the main quantity
  let targetValue = numericValuesArray [ 0 ] ;

  // Remove the first element as it's now stored separately
  numericValuesArray . shift ( ) ;

  /*
   * Debugging: Display the main quantity and the processed array
   * console.log({ targetValue, numericValuesArray });
   */

  // Sort the remaining numbers in ascending order
  numericValuesArray.sort( ( firstElement , secondElement ) => firstElement - secondElement ) ;

  /*
   * Debugging: Display the main quantity and the sorted array
   * console.log({ targetValue, numericValuesArray });
   */

  // Calculate the limiting factor based on the smallest value
  let limitingFactor = Math.ceil ( targetValue / numericValuesArray [ 0 ] ) ;

  // Compute the ultimate outcome by adding a constant offset
  let finalResult = limitingFactor + 4 ;

  // Output the computed final result
  console.log ( finalResult ) ;
}

// Invoke the primary processing function with content from standard input
primaryProcess ( require("fs").readFileSync ( "/dev/stdin" , "utf8" ) ) ;