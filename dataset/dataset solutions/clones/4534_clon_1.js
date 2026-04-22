'use strict'
; /* Ensure strict mode is enabled for the entire script. */


  let lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ; // Read input from standard input, decode as UTF-8, and split into lines.


    const N = + lines [ 0 ] ; /* Convert the first line to a number and store it. */

  const S = lines [ 1 ] ; // The second line is the string we need to process.


let S2 = S; /* Initialize S2 with the original string S. This variable will be modified. */


let lOld = 0 ; // Variable to store the length of S2 from the previous iteration.


  let lNew = S2 . length ; // Variable to store the current length of S2.

/*
 * The core logic to remove all balanced parentheses '()' pairs.
 * This loop continues as long as a '()' pair is found and removed,
 * which changes the length of the string.
 */
while ( lOld != lNew )
{
    // Update lOld with the length from the *previous* iteration (now current).
    lOld = lNew ;

    // Replace all occurrences of "()" with an empty string.
    S2 = S2 . replace ( /\(\)/g , '' ) ;

    // Update lNew with the length of S2 *after* the replacement.
    lNew = S2 . length ;
}


  let s2 = S2 . replace ( /\)/g , '' ) ; // After removing '()', remove all remaining closing parentheses ')'.
                                     // This leaves only opening parentheses '(' in 's2'.


/*
 * Construct the final output string:
 * 1. Calculate the number of leading '(' needed: S2.length - s2.length.
 *    S2 now contains only unbalanced parentheses (e.g., "(((" or ")))").
 *    s2 contains S2 with all ')' removed (e.g., "(((").
 *    The difference is the number of ')' in S2. Each remaining ')' in S2 needs a matching leading '('.
 * 2. Append the original string S.
 * 3. Calculate the number of trailing ')' needed: s2.length.
 *    s2 contains only '(' characters from the original S that are now unmatched.
 *    Each remaining '(' in s2 needs a matching trailing ')'.
 */
console . log ( '('.repeat ( S2 . length - s2 . length ) + S + ')' . repeat ( s2 . length ) ) ;