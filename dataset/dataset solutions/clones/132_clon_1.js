/*
 * This is a Type I clone of the original JavaScript code provided.
 * It demonstrates extensive changes in whitespace and comments
 * while maintaining the exact logical structure and identifiers.
 * This ensures it is logically identical to the original.
 */

// Initialize the two counters 'a' and 'b' to zero.
a   =   b   =   0;

// Start a chain of operations to read, process, and parse input data.
require ( "fs" )
  .readFileSync (
    "/dev/stdin" , // Specifies the standard input file path.
    "utf8"         // Defines the character encoding for reading the file.
  )
  .trim ()         // Removes any leading or trailing whitespace from the entire input string.
  .split ( '\n' )  // Splits the input string into an array of lines, using newline as a delimiter.
  .map (           // Iterates over each line in the array.
    function ( i ) { // 'i' represents the current line being processed.

      // Split the current line 'i' by commas to get an array of string parts.
      c   =   i.split ( ',' ) ;

      // Assign the parts to variables x, y, and z.
      // Note: These will be strings initially, but JavaScript's arithmetic
      // operators will implicitly convert them to numbers.
      x   =   c [ 0 ] ,
      y   =   c [ 1 ] ,
      z   =   c [ 2 ] ;

      // This is a nested ternary operator structure.
      // It checks conditions based on the values of x, y, and z.
      z   *   z   -   y   *   y   -   x   *   x
        ?   // If (z*z - y*y - x*x) is non-zero (truthy):
            // Then evaluate the next condition.
            y   -   x
              ?   // If (y - x) is non-zero (truthy):
                  // Do nothing (the '0' here means no side effect for this path).
                  0
              :   // Else (if y - x is zero, meaning y === x):
                  // Increment counter 'b'.
                  b ++
        :   // Else (if z*z - y*y - x*x is zero):
            // Increment counter 'a'.
            a ++
    }
  ) ; // End of the map function and its chained call.

// Output the final values of counter 'a' and counter 'b'.
// They are joined by a newline character for separate lines in the output.
console . log ( a   +   '\n'   +   b ) ;

// End of the Type I cloned script.