/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally equivalent program.
 */

/*
 * Section 1: Input Reading
 * ----------------------------------------------------
 * This part is responsible for reading data from the standard input stream.
 * It uses Node.js's built-in 'fs' (file system) module for synchronous reading.
 */

const   input     =     require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   ) ;


// A blank line for visual separation.


/*
 * Section 2: Core Logic and Output
 * ----------------------------------------------------
 * This section performs a calculation based on the input string
 * and then prints a result to the console.
 */

// Calculate a number from specific characters of the input string.
// input[0] is the hundreds digit.
// input[2] is the tens digit.
// input[4] is the units digit.
// The result is then checked for divisibility by 4.

console
    .
log
    (
        (
              (
                  input
                  [
                      0
                  ]
                  *
                  100
              )
            +
              (
                  input
                  [
                      2
                  ]
                  *
                  10
              )
            +
              (
                  input
                  [
                      4
                  ]
                  *
                  1
              )
        )
        %
        4
        ===
        0
            ?
        'YES'
            :
        'NO'
    )
;   // End of the main console.log statement.

/*
 * End of script.
 * No further operations are performed.
 */