function CalculateFinalValue(sourceData) {
  // Enforce strict mode for cleaner code practices
  'use strict' ;
  /* Process the raw input string:
   * 1. Remove leading/trailing whitespace.
   * 2. Split into an array by spaces.
   * 3. Convert each part to an integer.
   */
  const numericComponents= sourceData . trim ( ) . split ( ' ' ) . map ( ( val ) => parseInt ( val ) ) ;

  // Calculate the number of full cycles
  const totalCycles = Math . floor ( numericComponents [ 0 ] / ( numericComponents [ 1 ] + numericComponents [ 2 ] ) ) ;

  // Determine the remaining portion after full cycles
  const remainingPart = numericComponents [ 0 ] % ( numericComponents [ 1 ] + numericComponents [ 2 ] ) ;

  // Compute a conditional intermediate result
  const conditionalPart = ( numericComponents [ 1 ] < remainingPart ) ? numericComponents [ 1 ] : remainingPart ;

  // Output the final calculated sum
  console . log ( totalCycles * numericComponents [ 1 ] + conditionalPart ) ;
}
// Execute the primary function with data read from standard input
CalculateFinalValue ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;