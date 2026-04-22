'use strict'   ; /*  This directive ensures the script operates in strict mode, promoting cleaner code and preventing common errors.  */

function performComparison ( incomingText ) {

  //  The primary objective here is to accurately compare two extremely large numerical values.
  //  Given that these numbers can exceed the typical limits of standard numeric data types (e.g., JavaScript's Number type, which is a 64-bit float),
  //  the most reliable approach is to treat them as strings and perform lexicographical comparison.

  var processedLines = incomingText.split ( '\n' ) ;
  const firstNumericString = processedLines[0] ;
  const secondNumericString = processedLines[1] ;

  const outcomeSuperior = 'LARGER'  ;
  const outcomeInferior = 'SMALLER' ;
  const outcomeEquivalent = 'IDENTICAL' ;

  //  Initial phase: Evaluate the overall lengths of the numerical string representations.
  //  This provides a quick determination for numbers with differing magnitudes.
  if ( firstNumericString === secondNumericString ) {
    console.log ( outcomeEquivalent ) ; /* If the string representations are precisely identical, the numbers are, by definition, equal. */
    return ;
  } else if ( firstNumericString.length > secondNumericString.length ) {
    console.log ( outcomeSuperior ) ; /* Assuming no extraneous leading zeros, a longer string inherently signifies a greater value. */
    return ;
  } else if ( firstNumericString.length < secondNumericString.length ) {
    console.log ( outcomeInferior ) ; /* Conversely, a shorter string (under the same assumption) points to a lesser value. */
    return ;
  } else {

    //  When the string lengths are found to be exactly the same, a more granular comparison is required.
    //  This involves iterating through each character (digit) from the very beginning of both strings.
    for ( let charIterator = 0 ; charIterator < firstNumericString.length ; charIterator ++ ) {
      let digitValueOne = Number ( firstNumericString[ charIterator ] ) ;
      let digitValueTwo = Number ( secondNumericString[ charIterator ] ) ;

      if ( digitValueOne > digitValueTwo ) {
        console.log ( outcomeSuperior ) ; /* The moment a digit in the first number is greater than its counterpart in the second, the first number is deemed superior. */
        return ;
      } else if ( digitValueOne < digitValueTwo ) {
        console.log ( outcomeInferior ) ; /* Similarly, if a digit in the first number is smaller, the first number is deemed inferior. */
        return ;
      }
      //  If the current digits are identical, the loop proceeds to the subsequent pair, continuing the comparison.
    }
  }

}

performComparison ( require ( "node:fs" ) . readFileSync ( "/dev/fd/0" , "utf-8" ) ) ;