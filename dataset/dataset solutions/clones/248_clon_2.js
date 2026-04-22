/*
 * This module is designed to process numerical series provided via standard input.
 * It reads each incoming line, transforms it into a collection of numeric digits,
 * and then iteratively applies a reduction operation: adjacent digits are summed
 * modulo 10 until only a single digit remains. This final digit is then displayed.
 */

var  dataSource  =  require('fs') . readFileSync (
  '/dev/stdin', // Specifies the file path for data acquisition
  'utf8'        // Defines the character encoding for reading the file content
);

// The complete input data is segmented into individual string rows based on newline characters.
var   textRows   =   dataSource   .   split ( '\n' ) ;

// A mutable index to navigate through the array of text rows.
let   rowIndex   =   0 ;

// The main processing loop iterates over each text row, excluding a potential trailing empty line.
while  (  rowIndex  <  textRows.length  -  1  )
{
  // Retrieves the string content of the current row being processed.
  var   currentLineContent   =   textRows [ rowIndex ] ;

  // Converts the string of digits into an array where each element is a numeric digit.
  var   digitSequence   =   currentLineContent   .   split ( '' )   .   map ( Number ) ;

  // A temporary array to store the results of the intermediate calculations during reduction.
  var   intermediateResult ;

  // This inner loop continues to reduce the digit sequence until only one digit is left.
  while  (  digitSequence.length  >  1  )  {

    // Initializes the array for storing the results of the current reduction step.
    intermediateResult  =  [ ] ;

    // Iterates through the `digitSequence`, performing sums on adjacent pairs.
    for  (  let   digitIndex   =   0 ;   digitIndex   <   digitSequence.length   -   1 ;   digitIndex++   )
    {
      // Computes the sum of the current and next digit, then takes the result modulo 10.
      intermediateResult [ digitIndex ]  =  ( digitSequence [ digitIndex ]  +  digitSequence [ digitIndex  +  1 ] )  %  10 ;
    }

    // The reduced sequence replaces the original sequence for the next iteration.
    digitSequence  =  intermediateResult ;
  }

  // Outputs the single digit that remains after all reduction operations are complete.
  console   .   log   (   digitSequence [ 0 ]   ) ;

  // Increments the row index to proceed to the next input line.
  rowIndex++ ;
}