/*
 * This is a Type I clone of some JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been altered.
 *
 * Original purpose: Read input, parse as integer, then output modulo 1000.
 */


function   Main

  (

    input

  )

{
  // Start of the Main function's core logic.
  // This line processes the input and prints the result.
  console
    .
    log
    (

      parseInt

        (
          input
        )

      %

      1000

    )
  ; // End of the console.log statement.

} // End of the Main function definition.



/*
 * The following line is crucial for the program's execution environment.
 * It reads from standard input and passes the content to the Main function.
 * Please do not modify this part for execution purposes.
 */
Main
  (
    require
      (
        "fs"
      )
      .
      readFileSync
      (
        "/dev/stdin"
        ,
        "utf8"
      )
  )
; // Program execution starts here by invoking Main.