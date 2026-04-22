/*
 * This self-executing function processes a given text input
 * to compute a specific modular product based on range boundaries.
 */
( ( rawData ) => { // Start of the main processing unit, accepting raw text.

  // Split the input string by newline characters to obtain an array of individual lines.
  const textSegments = rawData.split ( '\n' ) ;

  // Process the very first line to extract numerical boundary values,
  // splitting it by space characters.
  const boundaryStrings = textSegments [ 0 ] . split ( ' ' ) ;

  // Convert the string parts into numerical values for the lower and upper limits.
  const lowerLimit = + boundaryStrings [ 0 ] ; // The starting integer for the range.
  const upperLimit = + boundaryStrings [ 1 ] ; // The ending integer for the range.

  // First conditional check: Determine if the range is wide enough
  // to guarantee a product of 0 modulo 2019, or if 2019 is within the range.
  if ( upperLimit - lowerLimit >= 2019 || lowerLimit - ( lowerLimit % 2019 ) + 2019 <= upperLimit )
  {
    // If the condition is met, the minimum product modulo 2019 must be 0.
    console.log ( 0 ) ;
    return ; // Terminate the function's execution immediately.
  }

  // Second conditional check: Handle a specific edge case where the range difference is exactly one.
  if ( upperLimit - lowerLimit === 1 ) {
    // In this specific scenario, the result is simply the lower limit modulo 2019.
    console . log ( lowerLimit % 2019 ) ;
    return ; // Exit the function.
  }

  // Initialize a variable to store the smallest product found so far.
  // Using 'let' for modern JavaScript variable declaration, initialized to positive infinity.
  let smallestResult = Infinity ;

  // Outer loop: Iterates 'firstFactor' from the lower limit up to one less than the upper limit.
  for ( let firstFactor = lowerLimit ; firstFactor <= upperLimit - 1 ; firstFactor += 1 )
  {
    // Inner loop: Iterates 'secondFactor' from one greater than the lower limit up to the upper limit.
    for ( let secondFactor = lowerLimit + 1 ; secondFactor <= upperLimit ; secondFactor += 1 )
    {
      // Calculate the product of the modulo 2019 values of the two current factors,
      // then take the modulo 2019 of that product.
      // Update 'smallestResult' if the current calculation yields a smaller value.
      smallestResult = Math . min ( smallestResult , ( ( firstFactor % 2019 ) * ( secondFactor % 2019 ) ) % 2019 ) ;
    }
  }

  // Output the final computed minimum modular product to the console.
  console . log ( smallestResult ) ;
} ) ( // Invoke the function immediately with the following input.
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) // Read content from standard input synchronously as UTF-8.
) ; // End of the Immediately Invoked Function Expression (IIFE) and its execution.