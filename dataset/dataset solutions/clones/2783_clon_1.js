/*
 * This JavaScript file adheres to strict mode.
 * It's a best practice for modern JavaScript development.
 */
'use strict' ; // Enabling strict mode for cleaner code and fewer errors.


/**
 * The primary function responsible for processing input and producing the desired output.
 * It expects a string as input, typically read from standard input.
 *
 * @param   {string}   input   The raw string data provided to the script.
 * @returns {void}
 */
function   main
(
  input
)
{
  // Process the raw input string.
  // First, remove any extraneous whitespace from the ends.
  // Then, split the string into an array of lines based on newline characters.
  input   =   input . trim ( ) . split ( '\n' ) ;

  // The first line of input contains a single number, N.
  // Parse this string into a numerical value.
  const   N   =   Number (   input [   0   ]   )   ;

  // The second line contains a sequence of numbers, separated by spaces.
  // Split this line into individual string representations of numbers.
  // Then, map each string to its integer equivalent using parseInt with radix 10.
  const   nums   =   input [   1   ] . split (   ' '   ) . map (   v   =>   parseInt (   v   ,   10   )   )   ;


  // Initialize a counter. This will store the number of elements that meet a specific condition.
  let   count   =   0   ;

  // Iterate through the 'nums' array.
  // The loop starts from the second element (index 1) and goes up to the second-to-last element (N-2).
  // This is because each element needs to be compared with its immediate neighbors (i-1 and i+1).
  for
  (
    let   i   =   1   ;
    i   <   N   -   1   ;
    i ++
  )
  {
    /*
     * Check if the current number (nums[i]) is "between" its neighbors.
     * This means either:
     * 1. The number is smaller than the left neighbor AND larger than the right neighbor (a "valley" point).
     *    Example: [5, 2, 4] -> 2 is between 5 and 4.
     * OR
     * 2. The number is smaller than the right neighbor AND larger than the left neighbor (a "peak" point).
     *    Example: [2, 5, 3] -> 5 is between 2 and 3.
     */
    if
    (
         (   nums [ i ]   <   nums [ i - 1 ]   &&   nums [ i ]   >   nums [ i + 1 ]   )
      || (   nums [ i ]   <   nums [ i + 1 ]   &&   nums [ i ]   >   nums [ i - 1 ]   )
    )
    {
      // If the condition is true, increment our counter.
      count ++ ;
    }
  }

  // After the loop completes, print the final accumulated count to the standard output.
  console . log (   count   )   ;
}


// This is the entry point for the script.
// It reads the entire content of standard input, assuming it's UTF-8 encoded.
// The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
main
(
  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
)
; // End of script execution.