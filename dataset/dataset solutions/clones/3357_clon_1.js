/* This file contains a solution to a programming problem.
 * It calculates a specific value based on three input numbers. */
"use strict" ; // Enable strict mode for better error handling

const   main    =   (   arg   )   =>    {
  // Parse input values from the argument string
      let     a     =     parseInt (   input .   split (   " "   )   [   0   ]   )   ;

      let     b     =     parseInt (   input .   split (   " "   )   [   1   ]   )   ;

      let     c     =     parseInt (   input .   split (   " "   )   [   2   ]   )   ;


  // Initialize the answer variable
    let     ans     =     0   ;

  // Conditional logic based on b and c
    if  (   b     >=     c   )   {
        // Case where b is greater than or equal to c
          ans     +=     c   +   b   ;
            c     =     0   ;
    }   else    {
        // Case where b is less than c
          ans     +=     b   *   2   ;
            c   -=   b   ,     b     =     0   ; // Decrement c by b and reset b
    }


  // Further processing if c is still positive
    if  (   c   >   0   )   {
        // Determine a temporary value
          let     tmp     =     Math .   min (   c   ,   a   )   ;

            c   -=   tmp   ; // Reduce c by tmp

              ans   +=   tmp   ; // Add tmp to the answer
    }


  // Final check for c
    if  (   c   >   0   )     ans   ++   ; // If c is still positive, increment ans by 1

    console .   log (   ans   )   ; // Output the final calculated answer

}   ; // End of the main function

// Read input from standard input and pass it to the main function
main  (   require (   'fs'   )   .   readFileSync (   '/dev/stdin'   ,     'utf8'   )   )   ;