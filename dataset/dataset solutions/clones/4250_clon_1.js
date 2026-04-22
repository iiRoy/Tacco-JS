/*
 * This JavaScript code defines a function 'main' that processes
 * a string input, typically representing a grid. It then checks
 * a specific condition across two rows of this grid.
 *
 * This is a Type I clone, meaning its functionality and
 * all original identifiers, operators, and expressions
 * are preserved exactly as in the original source code.
 * Only whitespace (spaces, tabs, newlines) and comments
 * have been altered extensively to create a visually
 * distinct but functionally identical version.
 */

const   main   =   (   input   )   =>   {
  // The 'main' function serves as the primary entry point
  // for the program's logic. It accepts one argument: 'input',
  // which is expected to be a string.

  // Process the raw input string:
  // 1. '.trim()' removes any leading or trailing whitespace.
  // 2. '.split('\n')' divides the cleaned string into an array of
  //    substrings, using the newline character as a delimiter.
  //    Each element of 'grid' will represent a line from the input.
  const   grid   =   input
    .   trim   (   )
    .   split   (   '\n'   )   ;

  // Initiate a 'for' loop to iterate a fixed number of times.
  // This loop will run for 'i' values of 0, 1, and 2.
  for   (   let   i   =   0   ;   i   <   3   ;   i   ++   )   {
    // Inside the loop, a conditional check is performed.
    // It compares a character from the first line (grid[0])
    // with a character from the second line (grid[1]).
    // The index for the second line's character is calculated
    // as (3 - 1 - i), effectively mirroring the 'i' index.
    if   (   grid   [   0   ]   .   charAt   (   i   )   !==   grid   [   1   ]   .   charAt   (   3   -   1   -   i   )   )   {
      // If the characters at the respective positions do not match,
      // the specific condition being tested is not met.
      console   .   log   (   'NO'   )   ;   // Output 'NO' to the console.
      return   ;   // Immediately exit the 'main' function.
                  // No further checks are necessary.
    }
  }

  // If the loop completes without any 'return' statement being executed,
  // it signifies that all character comparisons passed successfully.
  // Therefore, the condition is met.
  console   .   log   (   'YES'   )   ;   // Output 'YES' to the console.
}

// --- Program Entry Point and Standard Input Handling ---
// This section is responsible for reading input and invoking the 'main' function.
// It leverages Node.js's built-in 'fs' (file system) module.
main   (
  require   (   "fs"   )   // Access the file system module.
    .   readFileSync   (   "/dev/stdin"   ,   // Read the entire content of '/dev/stdin',
                       "utf8"   )   // which typically represents standard input,
                                   // using UTF-8 character encoding.
)   ;