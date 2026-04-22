/*
 * This file contains a JavaScript program designed to process a string
 * of '0's and '1's. The primary goal is to count specific patterns
 * and modify the input string iteratively until no more patterns are found.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0 (Type I Clone)
 */

function   Main  (  input  )    {

  // The 'Main' function serves as the entry point for the program's logic.
  // It takes a single string argument, 'input'.

  input = input . split ( "" ) ; // Converts the input string into an array of characters.
                               // For example, "1010" becomes ['1', '0', '1', '0'].

  /*
   * `isloop_out` is a boolean flag.
   * It controls the termination of the outer `while` loop.
   * If no matches are found in an entire pass of the inner `for` loop,
   * this flag remains `true`, signaling the outer loop to break.
   */
  isloop_out = true ;

  // `P` is an integer counter.
  // It keeps track of the number of successful pattern matches ("10" or "01").
  P = 0 ;


  while  (  true  )    { // This is an infinite loop; it will be explicitly broken out of.

    isloop_out = true ; // Reset the flag at the beginning of each outer loop iteration.
                        // This assumes no matches have been found yet for the current pass.

    /*
     * The inner `for` loop iterates through the 'input' array.
     * Note that `input.length` can change within the loop due to `splice()`.
     * The `i` variable is implicitly declared in JavaScript if not explicitly `var`, `let`, or `const`.
     */
    for  (  i  =  0  ;  i  <  input . length  ;  i++  )    {

      // For debugging or observation, print the current state of the array.
      console . log ( input ) ;

      // First pattern check: "10"
      if  (  input [ i ]  ===  "1"   &&
           input [ i+1 ]  ===  "0"  )
      {
        // If "10" is found:
        P++ ;                             // Increment the match counter.
        isloop_out = false ;              // Set flag to false, indicating a change occurred.
                                          // This ensures the outer loop will continue for another pass.
        input . splice ( i , 2 ) ;        // Remove the matched pair from the array.
                                          // This also shifts subsequent elements.
      } // End of the 'if' block for "10" pattern.

      // Second pattern check: "01"
      if  (  input [ i ]  ===  "0"   &&
           input [ i+1 ]  ===  "1"  )
      {
        // If "01" is found:
        P++ ;                             // Increment the match counter.
        isloop_out = false ;              // Set flag to false, indicating a change.
        input . splice ( i , 2 ) ;        // Remove the matched pair from the array.
      } // End of the 'if' block for "01" pattern.

    } // End of the `for` loop. All elements (or what's left) have been checked.

    // After iterating through the array, if no matches were found (isloop_out is still true),
    // then it's time to exit the outer `while` loop.
    if  (  isloop_out  )    break ;

  } // End of the `while` loop.

  // The final result is `P` multiplied by 2.
  // This value is printed to the console.
  console . log ( P * 2 ) ;

} // End of the `Main` function definition.

/*
 * This part of the script handles reading input from standard input (/dev/stdin)
 * and then calls the `Main` function with that input.
 * It uses Node.js's 'fs' module.
 */
Main  (
  require  (  "fs"  )  .
    readFileSync  (
      "/dev/stdin"  , // Path to read from.
      "utf8"           // Encoding to use for reading the file.
    )
)  ; // Function call to Main.