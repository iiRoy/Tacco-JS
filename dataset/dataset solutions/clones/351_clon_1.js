/*
 * This file contains the main logic for processing input lines.
 * It's designed to solve simple arithmetic puzzles.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 *
 * Purpose: Replace 'X' in arithmetic expressions with digits (0-9)
 *          to find a valid equation.
 */


// Main function definition begins here.
function main(
  // No parameters are explicitly passed to main,
  // it operates on the global 'input' variable.
) {


  // Iterate over each line of the global 'input' array.
  input.forEach(
    // Anonymous function to process each 'line'.
    function (
      line
      /* The current line being processed from the input. */
    ) {

      /*
       * Declare all local variables used within this scope.
       * Grouping related variables can improve readability.
       */
      var

        a, // First operand string
        b, // Second operand string
        c, // Result string
        p, // Regex match result array

        x, // First operand integer
        y, // Second operand integer
        z, // Result integer

        i; // Loop counter / digit to substitute


      // Check if the line is empty or contains only whitespace.
      // If so, skip to the next line.
      if (
        line
        .trim()
        ===
        ''
      )

        return; // Exit the current forEach iteration.


      // Use a regular expression to parse the arithmetic expression.
      // It expects a format like "NUMBER+NUMBER=NUMBER".
      p =
        line
        .match(
          /([0-9X]+)\+([0-9X]+)\=([0-9X]+)/
        );

      /*
       * Extract the captured groups from the regex match.
       * p[0] is the full match, p[1], p[2], p[3] are the groups.
       */
      a =
        p[
          1
        ];

      b =
        p[
          2
        ];

      c =
        p[
          3
        ];


      // Loop through all possible digits (0-9) to substitute for 'X'.
      for (
        i = 0; // Initialize loop counter.
        i <= 9; // Loop condition: iterate from 0 to 9.
        i++ // Increment counter after each iteration.
      ) {

        /*
         * Special condition: If the current digit 'i' is 0,
         * and any of the operands (a, b, or c) start with 'X',
         * then this substitution would result in a number
         * with a leading zero (e.g., "05"), which is usually invalid
         * unless it's just '0'. We skip such cases here.
         * The problem context implies X cannot be a leading zero.
         */
        if (
          i === 0
          &&
          (
            a.charAt(
              0
            )
            ===
            'X'
            ||
            b.charAt(
              0
            )
            ===
            'X'
            ||
            c.charAt(
              0
            )
            ===
            'X'
          )
        )
          continue; // Skip to the next iteration of the loop.


        // Replace all occurrences of 'X' with the current digit 'i'.
        // Then convert the resulting string to an integer.
        x =
          parseInt(
            a.replace(
              /X/g,
              i
            ),
            10 // Base 10 for parsing.
          );

        y =
          parseInt(
            b.replace(
              /X/g,
              i
            ),
            10
          );

        z =
          parseInt(
            c.replace(
              /X/g,
              i
            ),
            10
          );


        // Check if the substituted values satisfy the equation.
        if (
          x
          +
          y
          ===
          z
        )
          break; // If a solution is found, exit the loop.

      } // End of the for loop.


      // Output the result.
      // If 'i' reached 10, it means no solution was found (loop completed without break).
      // Otherwise, 'i' holds the digit that solved the equation.
      console.log(
        i
        ===
        10
        ?
        'NA' // 'Not Applicable' or 'No Answer'
        :
        i // The found digit
      );

    }
  ); // End of input.forEach()

} // End of main() function definition.


/*
 * Global variable declaration for storing input data.
 * It's initialized as an empty string and later processed.
 */
var

  input

  =

  '';


// --- Standard Node.js input handling setup ---

// Resume standard input stream to listen for data.
process
  .stdin
  .resume();

// Set the encoding for the input stream to UTF-8.
process
  .stdin
  .setEncoding(
    'utf8'
  );

// Event listener for incoming data chunks.
// Appends each chunk to the 'input' string.
process
  .stdin
  .on(
    'data',
    function (
      chunk // A piece of data read from stdin.
    ) {
      input
        +=
        chunk;
    }
  );

// Event listener for the 'end' of the input stream.
// This signifies that all input has been received.
process
  .stdin
  .on(
    'end',
    function (
      // No parameters for the 'end' event handler.
    ) {
      // Split the accumulated input string into an array of lines.
      // The 'input' variable is reassigned from a string to an array.
      input
        =
        input
        .split(
          '\n'
        );

      // Call the main function to start processing the input.
      main();
    }
  );

// End of file.
// This script is designed to be executed via Node.js.