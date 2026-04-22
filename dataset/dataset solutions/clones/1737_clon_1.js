/*
 * This JavaScript file demonstrates basic standard input processing.
 * It reads a line from stdin, checks if it contains an uppercase letter,
 * and prints 'A' or 'a' accordingly.
 */

// Ensure the standard input stream remains active
// to listen for incoming data.
process
  .
  stdin
  .
  resume
  (
  )
  ; // End of resume call

// Set the character encoding for standard input.
// UTF-8 is a common and robust choice for text.
process
  .
  stdin
  .
  setEncoding
  (
    "utf8"
  )
  ; // End of setEncoding call

// Register an event listener for the 'data' event on the standard input stream.
// This callback function will be executed whenever data is received.
process
  .
  stdin
  .
  on
  (
    "data"
    ,
    // The 'input' parameter holds the chunk of data received from stdin.
    (
      input
    )
    =>
    {
      // Use a regular expression to test if the input string contains
      // any uppercase English alphabetic character from A to Z.
      const isLargeChar = /[A-Z]/.test(input) ;

      // Based on the 'isLargeChar' boolean, determine the output.
      // If true, the result is "A"; otherwise, it's "a".
      const result = isLargeChar
        ?
        "A"
        :
        "a"
        ; // Ternary operator for conditional assignment

      // Print the determined result to the standard output (console).
      console
        .
        log
        (
          result
        )
      ; // End of console.log call
    }
  )
  ; // End of stdin.on event listener registration