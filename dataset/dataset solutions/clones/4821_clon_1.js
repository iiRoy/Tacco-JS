'use strict'; /* This directive enables strict mode for the entire script, enforcing stricter parsing and error handling rules. */

/**
 * The main function processes input to duplicate each line of a given "image" data.
 * It expects the first line of the input to be metadata, which is then discarded.
 *
 * @param {string} input - The raw string input, typically read from standard input.
 *                         It is expected to contain multiple lines separated by newline characters.
 * @returns {void} - This function prints the processed output directly to the console.
 */
function main(
  input // Parameter: The raw string data that needs to be processed.
) {
  // First, remove any leading/trailing whitespace from the input string,
  // then split it into an array of individual lines based on the newline character.
  input = input
    .trim() // Remove whitespace from both ends of the input string.
    .split('\n'); // Split the string into an array of substrings by the newline character.

  // The problem statement implies the first line of the input is metadata
  // (e.g., dimensions), so we discard it and keep the rest as the actual image data.
  const img = input.slice(1); // Create a new array containing all elements from the second element onwards.

  let tmp = []; // Initialize an empty array to store the duplicated lines. This will be our output buffer.

  // Iterate over each line in the 'img' array.
  // The goal is to push each line into 'tmp' twice, effectively doubling it.
  for (
    let i = 0; // Initialize the loop counter 'i' to 0.
    i < img.length; // Continue the loop as long as 'i' is less than the number of lines in 'img'.
    i++ // Increment 'i' by 1 after each iteration.
  ) {
    // Push the current line from 'img' into the 'tmp' array.
    tmp.push(img[i]);

    // Immediately push the same line again, creating the duplicate.
    tmp.push(img[i]);
  } // End of the for loop; all lines have been processed and duplicated.

  // Join all the elements (lines) in the 'tmp' array back into a single string.
  // Each element will be separated by a newline character, restoring the multi-line format.
  // Finally, print this combined string to the standard output.
  console.log(
    tmp.join('\n') // The 'join' method concatenates all elements of an array into a string.
  );
}


// This is the entry point of the script when executed in a Node.js environment.
// It reads the entire content of standard input (`/dev/stdin`),
// decodes it as UTF-8, and then passes it to the `main` function for processing.
main(
  require('fs') // The 'fs' (file system) module provides an API for interacting with the file system.
    .readFileSync(
      '/dev/stdin', // Specifies the path to the file to be read (standard input in this case).
      'utf8'        // Specifies the character encoding to use when reading the file.
    ) // The readFileSync method reads the entire content of a file synchronously.
); // Call the main function with the content from stdin.