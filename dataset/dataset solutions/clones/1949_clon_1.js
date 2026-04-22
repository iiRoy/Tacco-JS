/*
 * This script processes a numerical string input
 * to find certain patterns. It reads from standard
 * input, performs calculations, and then outputs
 * a final count.
 */

// Global variable declaration for the input string.
// Reads the entire content of '/dev/stdin' as a UTF-8 string.
input  =  require('fs') . readFileSync (  '/dev/stdin'  ,  'utf8'  ) ;


// 'N' will store the input string split into an array of individual characters.
// This allows easier iteration over the string's components.
N  =  input . split ( '' ) ; /* Split the input into characters */


// 'r' is our result counter, initialized to zero.
// It will accumulate the count of valid substrings found.
r  =  0 ; // Initialize result counter


// Outer loop: iterates through each possible starting position 'i'
// for a substring within the input character array 'N'.
for (  i  =  0  ;  i  <  N . length  ;  i ++  )
{
  /*
   * Inner loop: iterates through each possible ending position 'j'
   * for a substring. The condition 'j = i + 4' ensures that
   * substrings are at least 4 characters long (j - i >= 4).
   * 'N.length - 1' is the last valid index.
   */
  for (  j  =  i  +  4  ;  j  <=  N . length  -  1  ;  j ++  )
  {
    // Extract a substring from the original 'input' string
    // starting at index 'i' and ending *before* index 'j'.
    // Then, convert this substring into an integer using base 10.
    v  =  parseInt (  input . substring (  i  ,  j  )  ,  10  ) ; // Convert substring to integer

    // Conditional check: if the integer 'v' is perfectly divisible by 2019
    // (i.e., the remainder of the division is zero).
    if  (  v  %  2019  ==  0  )
    {
      // If the condition is met, increment the result counter 'r'.
      r ++ ; // Increment the count of valid numbers
    }
  }
}

// Finally, print the total accumulated count 'r' to the console.
console . log (  r  ) ; // Display the final result