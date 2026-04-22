/*
 *  This JavaScript module processes an input string,
 *  determining a specific numeric value based on its content.
 *
 *  It utilizes an Immediately Invoked Function Expression (IIFE)
 *  to encapsulate its logic and execute it upon file loading.
 */
console.log(
  (
    args => { // The main anonymous arrow function starts here.
              // 'args' will receive the content from stdin.

      // Trim any leading or trailing whitespace from the input string.
      const s =
        args.trim();

      // Calculate the index of the last character in the trimmed string.
      // This is crucial for the two-pointer approach used later.
      const N = s.length - 1;


      let x = 0; // Initialize a counter 'x'. This variable will store the final result.
                 // It tracks the number of 'x' characters "processed" or "matched".


      // Begin a two-pointer iteration. 'i' starts at the beginning, 'j' at the end.
      // The loop continues as long as the left pointer 'i' has not crossed the right pointer 'j'.
      // In each step, both pointers move towards the center of the string.
      for (
        let i = 0, // Left pointer, initialized to the first character's index.
            j = N; // Right pointer, initialized to the last character's index.

        i < j;     // Condition: continue while the pointers haven't met or crossed.

        i++,       // Increment the left pointer after each iteration.
        j--        // Decrement the right pointer after each iteration.
      ) {
        // This inner loop handles mismatches between the characters at pointers 'i' and 'j'.
        // It continues as long as the characters are not identical.
        while (s[i] !== s[j]) {

          // Case 1: If the character at the left pointer ('i') is 'x'.
          if (s[i] === 'x') {
            x++; // Increment the counter 'x', as this 'x' can be used for a match.
            i++; // Move the left pointer forward to check the next character.
          }
          // Case 2: If the character at the right pointer ('j') is 'x'.
          else if (s[j] === 'x') {
            x++; // Increment the counter 'x', as this 'x' can be used for a match.
            j--; // Move the right pointer backward to check the previous character.
          }
          // Case 3: If neither character is 'x' and they don't match.
          // This indicates that the string cannot be made "palindromic"
          // by only changing 'x's.
          else {
            return '-1'; // Return the string "-1" to signify an impossible transformation.
          }
        }
      }

      // If the loop completes without returning '-1', it means the string
      // can be made "palindromic" by utilizing 'x's.
      // The final count of 'x's used is stored in the 'x' variable.
      // Return this count as a string.
      return `${x}`;
    } // End of the arrow function definition.

  )(
    // This part of the IIFE immediately invokes the function above.
    // It reads the entire content of '/dev/stdin' as a UTF-8 string.
    require('fs') // Access the Node.js 'fs' (file system) module.
    .readFileSync( // Use the synchronous file reading method.
      '/dev/stdin', // Path to standard input.
      'utf8'        // Specify the encoding for the input.
    )
  ) // End of the IIFE invocation.
); // End of the console.log call.