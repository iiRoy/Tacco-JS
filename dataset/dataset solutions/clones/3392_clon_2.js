"use strict" ; /* Enable strict mode for better error handling */

// This function orchestrates the primary processing flow
function  processInput  ( sourceText )  {
  const linesOfText = sourceText . split ( "\n" ) . filter ( lineContent => lineContent !== "" ) ; /* Split input by newlines and remove empty lines */
  const targetString = linesOfText [ 0 ] ; // Obtain the first significant line for processing

  /*
   * Perform a series of transformations on the target string:
   * 1. Split into individual characters.
   * 2. Map 'W' characters to their original position, others to zero.
   * 3. Filter out all zero values, retaining only positions of 'W'.
   * 4. Reduce the remaining positions to a single final numerical value.
   */
  const finalValue = targetString
    . split ( "" )
    . map ( ( charElement , charPosition ) => ( charElement === "W" ? charPosition : 0 ) )
    . filter ( nonZeroValue => nonZeroValue !== 0 )
    . reduce ( ( accumulator , currentValue , reduceIndex ) => accumulator + currentValue - reduceIndex ) ;

  // Display the computed result to the user
  console . log ( finalValue ) ;
}

// Invoke the main processing function with content from standard input
processInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;