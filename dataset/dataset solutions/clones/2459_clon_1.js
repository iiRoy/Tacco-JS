/*
 * This JavaScript code reads input from stdin, processes it,
 * and then prints a calculated total to stdout.
 * It appears to be parsing a sequence of '<' and '>' characters.
 */

// Import the 'fs' (file system) module to read input.
var code = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ;

// Declare and initialize several variables used throughout the program.
var prePattern = code [ 0 ] ; // Stores the first character of the input string.
var sNum       = 0           ; // Counter for '<' characters.
var bNum       = 0           ; // Counter for '>' characters.
var total      = 0           ; // Accumulator for the final result.

/*
 * Check if the very first character of the input string is a '>'.
 * If it is, prepend a '<' to the string to ensure it starts with '<'.
 * This is a specific rule for handling the input format.
 */
if ( code [ 0 ] === '>' )
{
  // Prepend a '<' character to the 'code' string.
  code = '<' + code ;
}

// Main loop to iterate through the modified code string.
// The loop condition is empty, as 'i' is incremented within nested loops.
for ( var i = 0 ; i < code . length ; )
{
  /*
   * Inner loop to count consecutive '<' characters.
   * It continues as long as 'i' is within bounds and the character at 'code[i]' is '<'.
   */
  for ( ; i < code . length ; i ++ )
  {
    // If the current character is not '<', break out of this inner loop.
    if ( code [ i ] !== '<' ) break ;
    // Increment the count of '<' characters.
    sNum += 1 ;
  }

  /*
   * Second inner loop to count consecutive '>' characters.
   * It continues from where the previous loop left off,
   * as long as 'i' is within bounds and the character at 'code[i]' is '>'.
   */
  for ( ; i < code . length ; i ++ )
  {
    // If the current character is not '>', break out of this inner loop.
    if ( code [ i ] !== '>' ) break ;
    // Increment the count of '>' characters.
    bNum += 1 ;
  }


  // Conditional logic based on the counts of '<' and '>' characters.
  if ( sNum > bNum )
  {
    /*
     * If the count of '<' (sNum) is greater than '>' (bNum),
     * calculate contributions to 'total'.
     * The first loop sums numbers from 0 up to sNum (inclusive).
     */
    for ( var j = 0 ; j <= sNum ; j ++ ) total += j ;
    // The second loop sums numbers from 0 up to bNum-1 (exclusive).
    for ( var j = 0 ; j < bNum ; j ++ ) total += j ;
  }
  else
  {
    /*
     * If sNum is not greater than bNum (i.e., sNum <= bNum),
     * calculate contributions to 'total' differently.
     * The first loop sums numbers from 0 up to sNum-1 (exclusive).
     */
    for ( var j = 0 ; j < sNum ; j ++ ) total += j ;
    // The second loop sums numbers from 0 up to bNum (inclusive).
    for ( var j = 0 ; j <= bNum ; j ++ ) total += j ;
  }

  // Reset the counters for '<' and '>' characters for the next iteration of the main loop.
  sNum = 0 ;
  bNum = 0 ;
}

// Finally, print the accumulated total to the console.
console . log ( total ) ;