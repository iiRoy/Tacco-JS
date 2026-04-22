/*
 * This JavaScript file contains the solution to a programming challenge.
 * It reads input from standard input, processes it, and writes the
 * result to standard output.
 *
 * The primary logic is encapsulated within the 'Main' function.
 */


function   Main   (   input   )   {
   // Entry point function for processing the given input.

   input  =  input . split ( "\n" ) ;  // First, split the entire input string into an array of lines.


   // Begin an infinite loop; it will be explicitly broken out of.
   for  (  var   i  =  0 ;  /* Loop condition: always true */  1  ;  i ++  )
   {
      // Declare and initialize the current number 'n' from the input line.
      var   n  =  parseInt ( input [ i ] ,  10 ) ;
      // Initialize an answer counter for the current 'n'.
      var   ans  =  0 ;


      // Check if the current number 'n' is the termination signal (0).
      if   (   n   ==   0   )
      {
         break ; // If 'n' is 0, exit the infinite loop immediately.
      }


      // Inner loop: Iterate with 'j' starting from 2 up to (but not including) 'n'.
      for   (   var   j  =  2 ;  j   <   n ;  j ++   )
      {
         /*
          * This conditional statement evaluates a specific mathematical relationship.
          * It checks if 'n' can be expressed in a certain form involving 'j'.
          * The expression `j * (j - 1) / 2` represents the sum of numbers from 1 to (j-1).
          *
          * Condition 1: `n - j * (j - 1) / 2 >= 0`
          * Ensures that the remaining part after subtracting the sum is non-negative.
          *
          * Condition 2: `(n - j * (j - 1) / 2) % j == 0`
          * Checks if this remaining part is perfectly divisible by 'j'.
          */
         if   (   n   -   j   *   (   j   -   1   )   /   2   >=   0   &&   (   n   -   j   *   (   j   -   1   )   /   2   )   %   j   ==   0   )
         {
            ans ++ ; // If both conditions hold true, increment the answer counter.
         }
      }

      // After checking all possible 'j' values for the current 'n', print the total count.
      console . log ( ans ) ;
   }
}


// This line executes the 'Main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's file system module and passes it as input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;