/*
 * This is a JavaScript file.
 * It strictly enforces modern JavaScript conventions.
 */
"use strict"

// Define the main function that processes the input.
function main(
  input // The raw input string provided to the function.
) {
  /*
   * First, the input string is processed.
   * It is split by newline characters to get individual lines.
   * Then, each line is converted to an integer using the bitwise NOT operator twice (~~).
   * This is a compact way to convert a string to an integer, effectively truncating decimals.
   */
  input =
    input
    .split(
      /\n/ // Regular expression to split by newline
    )
    .map(
      v =>
      ~~v // Converts each string element 'v' to an integer
    )

  // Initialize a new Set object to store unique numbers.
  // A Set automatically handles uniqueness, adding or removing elements efficiently.
  let
    set =
    new Set()

  /*
   * Iterate through the processed input array, starting from the second element (index 1).
   * The first element is often used for array size or other metadata,
   * so processing starts from the actual data.
   */
  for (
    let i =
      1; // Initialize loop counter 'i' to 1

    i <
    input
    .length; // Loop continues as long as 'i' is less than the array's length

    i++ // Increment 'i' after each iteration
  ) {
    // Check if the current number (input[i]) already exists in the set.
    if (
      set
      .has(
        input[
          i // Access the element at the current index 'i'
        ]
      )
    ) {
      // If the number is found, it means it's a duplicate.
      // Remove it from the set.
      set
        .delete(
          input[
            i // The element to be removed
          ]
        )
    } // End of 'if' block
    else {
      // If the number is not found, it's a new unique number.
      // Add it to the set.
      set
        .add(
          input[
            i // The element to be added
          ]
        )
    } // End of 'else' block
  } // End of 'for' loop

  // After processing all elements, print the final size of the set.
  // This size represents the count of unique numbers that appeared an odd number of times.
  console
    .log(
      set
      .size // Access the 'size' property of the Set object
    )
} // End of 'main' function definition

// Call the main function with input read from standard input.
// The 'fs' module is used to read the file synchronously.
main(
  require(
    "fs" // Node.js file system module
  )
  .readFileSync(
    "/dev/stdin", // Path to standard input on Unix-like systems
    "utf8" // Encoding for the input file
  )
) // End of main function call