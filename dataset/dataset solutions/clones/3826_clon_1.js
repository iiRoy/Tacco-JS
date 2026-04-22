/* This is a Type I clone of the original JavaScript code.
 * It preserves all identifiers, operators, and logical structure,
 * only modifying whitespace and comments extensively to create a visually different but functionally identical version.
 */

"use strict" ;  //  Enforce strict mode to catch common coding mistakes

const   main   =   (  arg  )   =>   {
    // Trim any leading/trailing whitespace from the input and then split it into an array of lines.
    arg   =   arg . trim ( ) . split (  "\n"  ) ;

    // Parse the first number from the first line of the input.
    // It's assumed the first line contains space-separated values, and we take the first one.
    const   N   =   parseInt (  arg[0] . split (  " "  ) [0]  ) ;
    
    // Initialize the 'answer' variable. It will store the result of our computation.
    let   answer   =   1 ;
    
    // Outer loop: Iterates from 2 up to N (inclusive).
    // This loop represents the 'i' value in the problem's logic.
    for (  let   i = 2 ;   i <= N ;   i++  )   {
        // Inner loop: Iterates from 1 up to the current value of 'i' (inclusive).
        // This loop represents the 'j' value in the problem's logic.
        for  (  let   j = 1 ;   j <= i ;   j++  )   {
            let   temp   =   j ;  // A temporary variable to hold the current value being processed.
            let   cnt   =   0 ;   // A counter to track how many times 'temp' has been squared.

            /* The original code had commented-out console.log statements here:
             * // console.log(i);
             * // console.log(temp);
             * These have been removed as part of the Type I cloning process.
             */
            
            // This loop repeatedly squares 'temp' as long as two conditions are met:
            // 1. 'temp' is strictly less than 'i'.
            // 2. 'j' is not equal to 1 (this prevents infinite loops for j=1).
            while  (  temp  <  i   &&   j  !==  1  )   {
                temp   =   Math . pow (  temp ,  2  ) ;  // Square the 'temp' variable.
                cnt ++ ;  // Increment the counter each time 'temp' is squared.
            }
            
            // Another commented-out console.log from the original, now removed:
            // //console.log("i:" + i);
 
            // After the inner 'while' loop, check if 'temp' has become equal to 'i'
            // AND if 'temp' was squared at least once (i.e., cnt is not 0).
            if  (  temp   ===   i   &&   cnt   !==   0  )   {
                answer   =   i ;  // If both conditions are true, update the 'answer' with the current 'i'.
            }
        }
    }
    
    // Finally, print the calculated 'answer' to the console.
    console . log (  answer  ) ;
}

// Read input from standard input and pass it to the 'main' function.
// This setup is common in competitive programming environments.
main (  require ( 'fs' ) . readFileSync (  '/dev/stdin' ,  'utf8'  )  ) ;