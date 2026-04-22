const BKRT =

    "\n"; // Constant for a newline character, used for splitting input lines.

const SPAC = " "; // Constant for a space character, used for splitting input values.

const NOSP = ""; // Constant for an empty string, though not used in this specific logic.

function Main(input)
{
    // Process the raw input string into an array of individual string elements.
    // First, trim whitespace, then split by newlines, then for each line, split by spaces,
    // and finally flatten the array of arrays into a single array.
    input = [].concat(
        ...input.trim()
                .split(BKRT)
                .map(a => a.split(SPAC))
    );

    // Helper function to extract and return the next string element from the input array.
    const strShift = () => input.shift();

    // Helper function to extract the next string element and convert it to an integer.
    // The `~~` operator is a concise way to perform floor division (truncating decimals)
    // and convert to a number, effectively parsing an integer.
    const intShift = () => ~~input.shift();


    // Read the first integer value from the processed input.
    var a = intShift();

    // Read the second integer value from the processed input.
    var b = intShift();

    // Calculate the difference between b and a.
    var c = b - a;

    // Perform the final calculation based on c and b.
    // This formula calculates the sum of integers from 1 to c, then subtracts b.
    return c * (c + 1) / 2 - b;
}


// --- Execution Context Setup (for competitive programming platforms vs. local browser testing) ---
// This entire block is an Immediately Invoked Function Expression (IIFE)
// that handles input/output based on the environment.

( ( b , c , d ) =>
    "undefined" != typeof require
    ? // If `require` is defined (Node.js environment, typical for competitive programming)
      console.log(
          Main(
              require("fs")
                     .readFileSync(
                         "/dev/stdin" ,
                         "utf8"
                     )
          )
      )
    : // Otherwise (browser environment, for local testing)
      [
          // Prepare input for browser testing by stripping outer newlines
          b = b.split("\n")
               .slice(1, -1)
               .join("\n"),

          // Execute Main function within a try-catch block to display errors
          c = function()
          {
              try
              {
                  return Main(b)
              }
              catch (f)
              {
                  // Return error stack or message if an exception occurs
                  return f.stack || f.message
              }
          }(), // Immediately invoke this anonymous function

          // Determine the type of the result (c)
          d = typeof c,

          // If the result is not a string, convert it to JSON string for display
          "string" == d || (c = JSON.stringify(c)),

          // Dynamically create and append a form with text areas to display input, type, and result
          $("<form>")
              .append(
                  [
                      [10, b], // Input content
                      0,
                      [1, d],  // Type of result
                      0,
                      [10, c]  // Result content
                  ].map(f =>
                      $(
                          f ? "<textarea>" : "<br>", // Use textarea for content, br for spacing
                          f && {
                              rows: f[0],
                              cols: 40,
                              text: f[1]
                          } // Set attributes for textareas
                      )
                  )
              )
              .appendTo("body")
      ]
) // End of IIFE definition
(`
54 65
`); // Input data passed to the IIFE for browser testing