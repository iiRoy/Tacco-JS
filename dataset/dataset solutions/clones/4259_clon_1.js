/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input, processes it, and then prints an answer.
 */

// Define the main function that encapsulates the program logic.
function   Main   (   input   )   {

  // The input string is initially a single block.
  // We need to split it into an array of lines for easier processing.
  input   =   input.split (   "\n"   )   ;

  /*
   * The first line of the input typically contains the size 'n'.
   * Let's extract it.
   */
  var   n   =   input   [   0   ]   ;


  // The next three lines contain space-separated numbers.
  // We'll split these lines into temporary arrays.
  tmp1   =   input   [   1   ] .   split   (   " "   )   ; // Temporary array for the first set of numbers.
  tmp2   =   input   [   2   ] .   split   (   " "   )   ; /* Temporary array for the second set. */
  tmp3   =   input   [   3   ] .   split   (   " "   )   ; // Temporary array for the third set of numbers.


  // Initialize three main arrays 'a', 'b', and 'c' with a size of 'n',
  // filling them with zeros as a starting point.
  a   =   new   Array   (   n   ) .   fill   (   0   )   ;
  b   =   new   Array   (   n   ) .   fill   (   0   )   ;
  c   =   new   Array   (   n   ) .   fill   (   0   )   ;


  // Loop to populate array 'a' with integer values from tmp1.
  for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {
    a   [   i   ]   =   parseInt   (   tmp1   [   i   ]   )   ; // Convert string to integer.
  }

  // Loop to populate array 'b' from tmp2.
  for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {
    b   [   i   ]   =   parseInt   (   tmp2   [   i   ]   )   ; // Another conversion.
  }

  // Loop to populate array 'c' from tmp3.
  for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {
    c   [   i   ]   =   parseInt   (   tmp3   [   i   ]   )   ; // And one more.
  }

  // Initialize a variable to store the final answer.
  var   ans   =   0   ; // The counter for valid combinations.

  // Start of the main logic: three nested loops to find combinations.
  // Outer loop iterates through elements of array 'a'.
  for   (   i   =   0   ;   i   <   n   ;   i   ++   )   {

    // Middle loop iterates through elements of array 'b'.
    for   (   j   =   0   ;   j   <   n   ;   j   ++   )   {

      // Condition 1: Check if element from 'a' is less than element from 'b'.
      if   (   a   [   i   ]   <   b   [   j   ]   )   {

        // Inner loop iterates through elements of array 'c'.
        for   (   k   =   0   ;   k   <   n   ;   k   ++   )   {

          // Condition 2: Check if element from 'b' is less than element from 'c'.
          if   (   b   [   j   ]   <   c   [   k   ]   )   {
            ans   ++   ; // If both conditions are met, increment the answer counter.
          } // End of inner 'if' block.
        } // End of inner 'for' loop for 'k'.
      } // End of middle 'if' block.
    } // End of middle 'for' loop for 'j'.

  } // End of outer 'for' loop for 'i'.


  // Output the final calculated answer to the console.
  console .   log   (   '%s'   ,   ans   )   ;
} // End of the Main function definition.


// This part handles reading input from standard input and then
// calls the Main function with the read data.
Main   (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ; // Execute the main program.