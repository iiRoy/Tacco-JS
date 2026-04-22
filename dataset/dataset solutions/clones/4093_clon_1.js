/* This JavaScript code processes input from standard input,
 * performs a series of calculations, and prints the result
 * to standard output. It's designed to find a specific range (min and max).
 * The overall structure uses an Immediately Invoked Function Expression (IIFE).
 */
console.log(
  (
    (
      // The main anonymous function (IIFE) that processes the arguments.
      // 'args' will contain the raw string content read from standard input.
      args => {

        // --- Input Parsing Section ---
        // Parse the input arguments received as a single string.
        // 1. `args.trim()`: Remove any leading or trailing whitespace from the input string.
        // 2. `.split`\n``: Split the trimmed string into an array of lines based on the newline character.
        // 3. `.map(...)`: Iterate over each line to further process it.
        //    a. `r.split` ``: Split each line `r` into an array of strings based on space characters.
        //    b. `.map(v=>v|0)`: Iterate over each string `v` (which represents a number)
        //       and convert it to an integer using the bitwise OR 0 trick (fast integer conversion).
        // 4. `const [[K],A] = ...`: Destructure the resulting array of arrays.
        //    - The first element of the first array (which is `[K]`) is assigned to `K`.
        //    - The second array is assigned to `A`.
        const [
          [
            K // K represents the index for a specific check later.
          ],
          A // A is an array of numbers used in calculations.
        ] = args.trim().split`\n`.map(
          r => r.split` `.map(
            v => v | 0 // Convert string to integer
          )
        );

        // --- Initial Condition Check ---
        // Before starting the main loop, check a specific condition.
        // If the element at index `K-1` in array `A` is greater than 2,
        // it signifies an invalid input state or an unsolvable problem.
        if (
          A[K - 1] > 2 // Check the value at the (K-1)-th index
        ) {
          // If the condition is met, return '-1' as per problem requirements.
          return '-1';
        }

        // --- Initialization of Range Variables ---
        // Initialize the minimum and maximum values for the range.
        // These values will be iteratively refined in the subsequent loop.
        let min = 2, // Starting minimum value
          max = 3; // Starting maximum value

        // --- Main Calculation Loop ---
        // This loop iterates backwards through the array `A` (excluding the last element processed by K-1).
        // It refines the `min` and `max` range based on the current element `A[i]`.
        for (
          let i = K - 2; // Start from index K-2
          i >= 0; // Continue as long as the index is non-negative
          i-- // Decrement the index in each iteration
        ) {
          // Calculate the new minimum value.
          // `Math.ceil(min/A[i])`: Finds the smallest integer multiple that is >= current `min`.
          // `* A[i]`: Multiplies by `A[i]` to get the actual minimum value that is a multiple of `A[i]`.
          min = Math.ceil(min / A[i]) * A[i];

          // Calculate the new maximum value.
          // `Math.floor(max/A[i])`: Finds the largest integer multiple that is <= current `max`.
          // `* A[i]`: Multiplies by `A[i]` to get the actual maximum value that is a multiple of `A[i]`.
          // `+ A[i] - 1`: Adjusts the maximum to be the largest value in the current range
          //              that is less than the next multiple of A[i].
          max = Math.floor(max / A[i]) * A[i] + A[i] - 1;

          // --- Loop Condition Check ---
          // After updating `min` and `max`, check for validity of the range.
          // If the calculated `max` falls below `A[i]` (meaning no valid range for this `A[i]`),
          // OR if the `min` value has somehow become greater than the `max` value (an invalid range),
          // then the problem is unsolvable with the given constraints.
          if (
            max < A[i] || // Maximum is too low
            min > max // Minimum exceeds maximum
          ) {
            // If either condition is met, return '-1'.
            return '-1';
          }
        }

        // --- Final Result ---
        // If the loop completes without encountering any invalid states,
        // the final `min` and `max` values represent the solution range.
        // Return these values as a space-separated string.
        return `${min} ${max}`;
      }
    )
    // --- IIFE Invocation ---
    // Immediately invoke the anonymous function by passing the input data.
    // `require('fs').readFileSync('/dev/stdin', 'utf8')`:
    //   - `require('fs')`: Imports the Node.js file system module.
    //   - `.readFileSync()`: Reads the content of a file synchronously.
    //   - `'/dev/stdin'`: Specifies to read from standard input.
    //   - `'utf8'`: Specifies the encoding of the input content.
    (
      require('fs').readFileSync('/dev/stdin', 'utf8')
    )
  )
);