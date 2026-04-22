/*
 * This JavaScript code defines a main function to process numerical input.
 * It calculates a specific sum based on the properties of an array of numbers,
 * primarily focusing on the count of negative numbers and the presence of zeros.
 */

function Main( input )
{
  // The input string is first split into an array of lines.
  input = input.split( "\n" ) ;

  // The first line is further split by spaces; we extract the first element.
  inputStr = input[ 0 ].split( " " ) ;

  // Parse the integer N from the first part of the first input line.
  var N = Number.parseInt( inputStr[ 0 ] ) ;

  // The second line of input contains the space-separated elements of array A.
  var A = input[ 1 ].split( " " ) ;

  // Variable declarations and initializations.
  var i = 0 ;            // Loop counter variable.
  var out = 0 ;          // This variable appears to be unused in the current logic.
  var val = 0 ;          // Used to store an absolute value for comparison later.
  var pos = 0 ;          // Stores the index of an element with a specific property.
  var abssum = 0 ;       // The primary accumulator for the absolute sum.
  var mainus_cnt = 0 ;   // Counts the occurrences of negative numbers (note: "mainus" is likely a typo for "minus").
  var zeroflg = 0 ;      // A flag (0 or 1) indicating whether a zero is present in array A.

  /*
   * First iteration: Traverse through array A to determine two key properties:
   * 1. The total count of negative numbers.
   * 2. Whether any zero is present in the array.
   */
  for ( i = 0 ; i < N ; i++ )
  {
    // Convert the current array element to an integer and check if it's negative.
    if ( Number.parseInt( A[ i ] ) < 0 )
    {
      mainus_cnt += 1 ; // Increment the counter for negative numbers.
    }

    // Convert the current array element to an integer and check if it's zero.
    if ( Number.parseInt( A[ i ] ) === 0 )
    {
      zeroflg = 1 ; // Set the zero flag to 1 if a zero is found.
    }
  }

  // Previous debugging console logs for 'mainus_cnt' and 'zeroflg' have been removed.

  /*
   * Conditional block: This logic is executed only if two specific conditions are met:
   * 1. No zero was found in the array (zeroflg remains 0).
   * 2. The count of negative numbers is odd.
   * Under these conditions, the goal is to find the element in 'A' with the smallest absolute value.
   */
  if ( zeroflg === 0 && ( mainus_cnt % 2 ) !== 0 )
  {
    // Initialize 'val' with the absolute value of the first element.
    val = Math.abs( Number.parseInt( A[ 0 ] ) ) ;
    // Initialize 'pos' with the index of the first element.
    pos = 0 ;

    // Iterate through the rest of the array (starting from the second element).
    for ( i = 1 ; i < N ; i++ )
    {
      // If the absolute value of the current element is smaller than the current 'val'.
      if ( val > Math.abs( Number.parseInt( A[ i ] ) ) )
      {
        val = Math.abs( Number.parseInt( A[ i ] ) ) ; // Update 'val' to this new smallest absolute value.
        pos = i ;                                      // Update 'pos' to the index of this element.
      }
    }
  }

  // Previous debugging console logs for 'val' and 'pos' have been removed.

  /*
   * Second iteration: Calculate the final 'abssum'.
   * The summation logic differs based on 'zeroflg' and 'mainus_cnt'.
   */
  for ( i = 0 ; i < N ; i++ )
  {
    // Previous debugging console logs for the loop counter 'i' have been removed.

    // If a zero was found OR the count of negative numbers is even:
    // Simply add the absolute value of the current element to 'abssum'.
    if ( zeroflg === 1 || ( ( mainus_cnt % 2 ) === 0 ) )
    {
      abssum = abssum + Math.abs( Number.parseInt( A[ i ] ) ) ;
    }
    else
    {
      // Otherwise (no zero AND an odd count of negative numbers):
      // If the current element is the one identified by 'pos' (smallest absolute value),
      // subtract its absolute value from 'abssum'. For all other elements, add their absolute values.
      if ( i === pos )
      {
        abssum = abssum - Math.abs( Number.parseInt( A[ i ] ) ) ;
      }
      else
      {
        abssum = abssum + Math.abs( Number.parseInt( A[ i ] ) ) ;
      }
    }
    // A commented-out line referring to a 'sum' variable that is not declared or used elsewhere.
    // sum = sum + Math.abs( Number.parseInt( A[ i ] ) ) ;
  }

  // Finally, print the calculated absolute sum to the console.
  console.log( abssum ) ;
}

// This line reads input from standard input (typically for competitive programming environments)
// and passes it as a string to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;