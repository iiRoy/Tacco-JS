/**
 * This is a Type I clone of a JavaScript program.
 * It calculates the longest common subsequence (LCS) of two input strings.
 * The original functionality is preserved exactly; only whitespace and comments are altered.
 *
 * Strict mode is enabled for this script.
 */
'use strict';

// Output the result of the immediately invoked function expression (IIFE) to the console.
console.log(

  // Define an anonymous function that takes 'args' as input.
  function (  args  ) {

    // Process the input arguments: trim whitespace and split by newline to get two strings.
    const   tmp   =   args .  trim(  )  .  split(  '\n'  )  ;

    // Assign the first and second parts to 's' and 't' respectively.
    const   s   =   tmp  [  0  ]  ,
            t   =   tmp  [  1  ]  ;

    // Get the lengths of string 's' and string 't'.
    const   sl   =   s .  length  ,
            tl   =   t .  length  ;

    // Initialize a 2D array (dp table) for dynamic programming.
    // The dimensions are (sl+1) x (tl+1), filled with empty strings.
    const   dp   =   Array(  sl + 1  )  .  fill(  0  )  .  map(
      _  =>  Array(  tl + 1  )  .  fill(  ''  )
    )  ;

    // Iterate through the strings to populate the DP table.
    // 'i' iterates over string 's' (0 to sl-1).
    for   (  let   i   =   0  ;   i   <   sl  ;   i  ++   )   {

      // 'j' iterates over string 't' (0 to tl-1).
      for   (  let   j   =   0  ;   j   <   tl  ;   j  ++   )   {

        // If characters match, extend the LCS from the previous diagonal cell.
        if   (  t  [  j  ]   ===   s  [  i  ]   )   {
          dp  [  i  +  1  ]  [  j  +  1  ]   =   dp  [  i  ]  [  j  ]   +   s  [  i  ]  ;
        }
        // If characters do not match, take the longer LCS from the cell above or to the left.
        else   {
          dp  [  i  +  1  ]  [  j  +  1  ]   =   dp  [  i  +  1  ]  [  j  ]  .  length   >   dp  [  i  ]  [  j  +  1  ]  .  length
                                             ?   dp  [  i  +  1  ]  [  j  ]
                                             :   dp  [  i  ]  [  j  +  1  ]  ;
        } // end of if-else for character comparison

      } // end of inner for loop (j)

    } // end of outer for loop (i)

    // The final result (LCS) is stored in the bottom-right cell of the DP table.
    return   dp  [  sl  ]  [  tl  ]  ;

  }  (
    // This is the argument passed to the IIFE:
    // It reads the entire content of standard input as a UTF-8 string.
    require(  'fs'  )  .  readFileSync(  '/dev/stdin'  ,   'utf8'  )
  )

)  ; // end of console.log call