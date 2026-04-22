console.log(
  // This is an Immediately Invoked Function Expression (IIFE).
  // It takes one argument, 'args', which will be the raw input string.
  (
    args => {

      /*
       *   The following block parses the input string.
       *   Expected format:
       *   Line 1: N T (two integers separated by a space)
       *   Line 2: t1 t2 ... tN (N integers separated by spaces)
       */
      const [
        [N, T], // Destructure the first line into N and T.
        t       // Destructure the second line into an array 't'.
      ] = args
        .trim()           // Remove any leading or trailing whitespace from the input.
        .split`\n`        // Split the string into an array of lines based on newline characters.
        .map(
          r => r.split` ` // For each line, split it into an array of strings by space.
            .map(
              v => v | 0   // Convert each string part to an integer using a bitwise OR with 0.
            )
        );


      // Sort the array 't' in ascending numerical order.
      // This is a critical step for the subsequent logic to correctly calculate the sum.
      t.sort(
        (a, b) => a - b // Standard comparison function for numerical sorting.
      );


      // Initialize the sum 's' with the base duration 'T'.
      let s = T;

      /*
       *   Iterate through the 't' array starting from the second element (index 1).
       *   This loop calculates the total effective duration.
       */
      for (
        let i = 1;     // Initialize loop counter 'i' to 1.
        i < N;         // Continue loop as long as 'i' is less than 'N'.
        i++            // Increment 'i' after each iteration.
      ) {
        // Check for overlap: If the end time of the previous item (t[i-1] + T)
        // extends beyond the start time of the current item (t[i]).
        if (
          t[i - 1]     // Start time of the previous item.
          +
          T            // Full duration of a single item.
          >
          t[i]         // Start time of the current item.
        ) {
          // If there's an overlap, add only the duration from the previous item's start
          // up to the current item's start, to avoid double-counting.
          s += t[i] - t[i - 1];
        } else {
          // If there's no overlap (or a gap), simply add the full duration 'T'.
          s += T;
        }
      }

      // Return the final calculated sum 's', converted to a string.
      return `${s}`;

    } // End of the IIFE function definition.
  )
  // Immediately invoke the function with the input.
  (
    // Read the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
    require('fs') // Access the Node.js 'fs' (file system) module.
      .readFileSync('/dev/stdin', 'utf8') // Read file synchronously.
  )
);
// End of the JavaScript program.