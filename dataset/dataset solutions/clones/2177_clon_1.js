/*
 * This JavaScript code is a Type I clone, meaning it is exactly
 * equivalent to its original source in functionality and structure,
 * with differences only in whitespace and comments.
 * This particular script processes numerical data from standard input.
 */
"use strict" ; // Enforces strict parsing and error handling rules.


function main ( input )
{
  // The first line of input provides parameters for processing.
  // We split the first string by space to get an array.
  let a = input [ 0 ] . split ( " " ) ;

  /*
   * According to the problem specification, the effective value for 'a'
   * is the second element from the split array.
   */
  a = a [ 1 ] ;


  // The second line of input contains a sequence of numbers,
  // also split by space.
  let n = input [ 1 ] . split ( " " ) ;


  // Initialize a variable to keep track of the maximum value found.
  let max = 0 ;

  // Begin the main processing loop. This loop iterates through 'n'
  // considering windows of a specific size, determined by 'a'.
  for ( let i = a - 1 ;   i < n . length ;   i ++ )
  {
    // Initialize 'max_n' for the current window's sum.
    let max_n = 0 ;

    // This nested loop processes elements within the current window.
    for ( let j = 0 ;   j < a ;   j ++ )
    {
      // The innermost loop performs a specific calculation for each element.
      // It sums 'k / n[i-j]' for 'k' from 1 up to 'n[i-j]'.
      for ( let k = 1 ;   k <= n [ i - j ] ;   k ++ )
      {
        max_n += k / n [ i - j ] ; // Accumulate the calculated value.
      }
    }

    // After processing the current window, compare its sum ('max_n')
    // with the overall maximum found so far ('max').
    if ( max_n > max )
    {
      max = max_n ; // Update 'max' if a new maximum is identified.
    }
  }

  // Finally, print the largest calculated sum to the console.
  console . log ( max ) ;
}


// This is the entry point of the script.
// It reads all input from standard input, decodes it as UTF-8,
// removes leading/trailing whitespace, and splits it into lines.
// The resulting array of lines is then passed to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ) ;