// This JavaScript program is designed to read numerical data from standard input,
// perform a series of intricate calculations, and then output a final integer result.
// It uses a concise, functional style combined with imperative loops for processing.

// Begin by requiring the 'fs' (File System) module, a core Node.js library.
require("fs")

  // Synchronously read the entire content of standard input.
  // The path "/dev/stdin" is a common Unix-like convention for standard input.
  .readFileSync(
    "/dev/stdin", // Specifies the file path for input.
    'utf8'        // Sets the character encoding for reading the file.
  )

  // Remove any leading or trailing whitespace (spaces, tabs, newlines) from the input string.
  .trim()

  // Split the cleaned input string into an array of substrings.
  // The regular expression `/\s/` matches any whitespace character, effectively
  // splitting the input based on spaces, tabs, newlines, etc.
  .split(/\s/)

  // Iterate over each element in the resulting array using the `map` method.
  // The `map` method transforms each element and creates a new array with the results.
  .map(
    // Define an anonymous function that takes a single argument 'i' (representing
    // each split part of the input) and processes it.
    function(i) {

      // Declare a variable 'j'. Assign to 'j' an array created by splitting the
      // current input part 'i' at every comma character.
      j = i.split(',');

      // Initialize three variables for the first loop:
      // 's' (sum/accumulator) is set to 0.
      // 'm' (loop counter) and 'n' (index/pointer) are both set to 10.
      // This loop runs from index 10 down to 0.
      for (
        s = 0,               // Initialize 's' to zero.
        m = n = 10;          // Initialize 'm' and 'n' to ten.
        m--;                 // Condition: loop as long as 'm' is greater than 0; decrement 'm' after each iteration.
      ) {
        // Compound assignment: Subtract the numerical value of j[m] from 's'.
        // Then, assign the new value of 's' back into j[m].
        // This effectively calculates a running sum (or difference) and stores it in the array 'j'.
        j[m] = s -= j[m];
      }

      // Re-calculate 's' using values from specific indices of the 'j' array.
      // This involves a division where the denominator includes a negation and subtraction.
      // Note: 'n' is still 10 from the previous loop's initialization.
      s *= j[11] / (-j[11] - j[n]);

      // This is the second loop. It's an empty loop (indicated by the standalone semicolon),
      // meaning its only action is its condition check and iteration logic.
      // It decrements 'n' (pre-decrement `j[--n]`) until the condition is no longer met.
      for (
        ;                           // No initialization part.
        j[--n] >= -s;               // Condition: loop as long as the value at the decremented 'n' index
                                    // in array 'j' is greater than or equal to the negative of 's'.
      )
        ;                           // Empty loop body: no operations are performed inside the loop.

      // After the second loop finishes, 'n' holds a specific value.
      // Increment 'n' by one (pre-increment `++n`), and then print this final value to the console.
      console.log(++n);
    }
  );