/*
 * This file contains utility functions and the main logic
 * for processing some input and performing calculations.
 *
 */


// Function to ensure a number string has leading zeros up to a specified length 'n'.
function zeroPadding (  numStr  ,  n  ) {

  var   zeros   =   ''  ; // Initialize an empty string for zeros.

  // Loop 'n' times to build the 'zeros' string.
  for (  var   k   =   0  ;   k   <   n  ;   k ++  ) {
    zeros   =   zeros   +   '0'  ; // Append a zero in each iteration.
  }

  /*
   * Concatenate the generated zeros with the number string,
   * then slice from the end to get the last 'n' characters,
   * effectively padding with zeros at the beginning.
   */
  return   (  zeros   +   numStr  ) .  slice  (  -n  )  ;

}




// The main function that orchestrates the program's logic.
function   main   (   input   ) {

  // Split the entire input string by newline characters into an array of lines.
  var   Lines   =   input .  split   (   '\n'   )  ;


  // Split the first line by spaces to get the first set of parameters.
  Lines [  0  ]   =   Lines [  0  ] .  split   (   ' '   )  ;

  // Split the second line by spaces to get the second set of parameters (x values).
  Lines [  1  ]   =   Lines [  1  ] .  split   (   ' '   )  ;


  // Parse the first element of the first line as integer N.
  var   N   =   parseInt   (   Lines [  0  ] [  0  ]   )  ;

  // Parse the second element of the first line as integer A.
  var   A   =   parseInt   (   Lines [  0  ] [  1  ]   )  ;


  // Assign the second line (array of x values) to variable x.
  var   x   =   Lines [  1  ]  ;


  // Calculate M as 2 raised to the power of N. This represents the total combinations.
  var   M   =   Math .  pow   (   2  ,  N   )  ;

  // Initialize a counter to keep track of matching combinations.
  var   counter   =   0  ;


  // Start a loop from 1 up to (but not including) M.
  // Each 'i' represents a combination in binary.
  for   (  var   i   =   1  ;   i   <   M  ;   i ++  ) {

    /*
     * Convert the current loop index 'i' to its binary string representation.
     * Then, pad it with leading zeros to ensure it has a length of N.
     */
    var   b   =   zeroPadding   (  (  i .  toString   (  2  )  )  ,  N  )  ;

    // Initialize sum B for the current combination.
    var   B   =   0  ;

    // Count the number of '1's in the binary string 'b'.
    var   n   =   b .  match   (  /1/g  ) .  length  ;


    // Loop through each character (bit) in the binary string 'b'.
    for   (  var   j   =   0  ;   j   <   N  ;   j ++  ) {
      // If the current bit is '1', add the corresponding x value (parsed as int) to B.
      // Otherwise, add 0.
      B   +=   (  b [  j  ]   ===   '1'  )   ?   parseInt   (  x [  j  ]  )   :   0  ;
    }

    // Check if the average of selected x values (B/n) is equal to A.
    if   (  A   ===   B   /   n  ) {
      console .  log   (  b  )  ; // If true, log the binary combination.
      counter ++  ; // Increment the counter.
    }

  }

  // After iterating through all combinations, log the total count.
  console .  log   (  counter  )  ;

}


// Execute the main function with input read from standard input.
main   (   require   (  'fs'  ) .  readFileSync   (  '/dev/stdin'  ,  'UTF-8'  )   )  ;