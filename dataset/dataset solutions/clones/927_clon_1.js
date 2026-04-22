/*
 * This is a Type I clone of a JavaScript program.
 * It demonstrates extensive modifications to whitespace and comments
 * while maintaining the exact sequence of all other tokens.
 */

/*
 * The original code's functionality and
 * structural integrity are completely preserved.
 * Only cosmetic changes have been applied.
 */

(
  function   main   (
  )
  {

    // --- Start of constant 'n' declaration and initialization ---
    /*
     * This section reads an integer value from standard input,
     * converts it to a number, and then increments it by one.
     * The 'fs' module is used for file system operations,
     * specifically for reading the content of '/dev/stdin'.
     */
    const
      n
      =
      Number
      (
        require
        (
          'fs'
        )
        .
        readFileSync
        (
          '/dev/stdin'
          ,
          'utf8'
        )
      )
      +
      1
    ; // Semicolon terminates the 'n' constant declaration.

    /*
     * A blank line for improved visual separation
     * between distinct logical parts of the code.
     */


    // --- Declaration of 'root5' constant ---
    /*
     * Here, the square root of 5 is calculated and stored.
     * This value is a fundamental component of Binet's formula,
     * which is used later to compute a Fibonacci-like sequence number.
     */
    const
      root5
      =
      Math
      .
      sqrt
      (
        5
      )
    ; // Semicolon terminates the 'root5' constant declaration.


    /*
     * Another visual separator.
     */


    // --- Main calculation and output statement ---
    /*
     * This block computes the result using a variation of Binet's formula.
     * The formula is F_n = (phi^n - psi^n) / sqrt(5), where:
     *   phi = (1 + sqrt(5)) / 2
     *   psi = (1 - sqrt(5)) / 2
     * The result is rounded to the nearest integer before being logged
     * to the console, as Fibonacci numbers are always integers.
     */
    console
    .
    log
    (
      Math
      .
      round
      (
            1
            /
            root5
          *
          (
                Math
                .
                pow
                (
                  (
                      1
                      +
                      root5
                  )
                  /
                  2
                  ,
                  n
                )
              -
                Math
                .
                pow
                (
                  (
                      1
                      -
                      root5
                  )
                  /
                  2
                  ,
                  n
                )
          )
      )
    )
    ; // Semicolon terminates the console.log call.


  } // End of the 'main' function body.
) // End of the function definition.
(
) // Invocation of the IIFE (Immediately Invoked Function Expression).
; // Semicolon after the IIFE call.

/*
 * End of the Type I cloned JavaScript code.
 * No logical or structural changes were made.
 */