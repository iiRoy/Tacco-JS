/*
 * This JavaScript program reads words from standard input,
 * identifies the most frequent word, and the longest word among them.
 * Finally, it prints these two words.
 */

// --- Variable Declarations and Initializations ---

// 'a' will serve as a hash map (object) to store the frequency of each word.
// Keys are words, values are their counts.
a = [];

// 'm' stores the maximum frequency encountered so far.
m = 0;

// 'l' stores the maximum length of a word encountered so far.
l = 0;

// 'n' stores the word that has the maximum frequency ('m').
n = '';

// 'c' stores the longest word encountered so far ('l').
c = '';

// --- Input Reading and Processing ---

// Require the 'fs' module for file system operations.
require("fs")
  // Read the content of standard input synchronously.
  .readFileSync(
    // Specify the path for standard input.
    "/dev/stdin",

    // Specify the encoding for the input content.
    "utf8"
  )
  // Remove any leading or trailing whitespace from the entire input string.
  .trim()
  // Split the processed string into an array of individual words using a space as the delimiter.
  .split(' ')
  // Iterate over each word in the array.
  // The 'some' method is used here, but its return value (boolean) is not utilized to stop iteration.
  // It effectively functions like a 'forEach' loop for side effects.
  .some(
    // Define an anonymous function to process each word.
    function (i) {
      // 'i' represents the current word being processed in the iteration.

      // --- Logic to find the most frequent word ---
      // This is a nested ternary operation to update word counts and track the maximum frequency.
      a[i]
        ? // If 'a[i]' is truthy (meaning the word 'i' has been seen before and has a count)
          (
            // Increment the count of word 'i'.
            // Then, check if this new count is greater than the current maximum frequency 'm'.
            ++a[i] > m
              ? // If the new count is indeed greater than 'm':
                (
                  // Update 'm' to this new maximum frequency.
                  // Simultaneously, update 'n' to store the current word 'i',
                  // as it is now the most frequent word found so far.
                  m = a[
                    n = i
                  ]
                )
              : // If the new count is not greater than 'm':
                0 // Do nothing (the maximum frequency and its word remain unchanged).
          )
        : // If 'a[i]' is falsy (meaning the word 'i' is encountered for the first time):
          (
            // Initialize the count for word 'i' to 1.
            a[i] = 1
          );

      // --- Logic to find the longest word ---
      // This is another ternary operation to track the longest word and its length.
      (
        // Assign the length of the current word 'i' to a temporary variable 't'.
        t = i.length
      ) > l
        ? // If 't' (current word's length) is greater than 'l' (maximum length found so far):
          (
            // Update 'c' to store the current word 'i' as the new longest word.
            c = i,
            // Update 'l' to store the new maximum length 't'.
            l = t
          )
        : // If 't' is not greater than 'l':
          0; // Do nothing (the longest word and its length remain unchanged).
    } // End of the anonymous function for 'some'
  ); // End of the 'some' method call

// --- Output Results ---

// Print the most frequent word ('n') and the longest word ('c'), separated by a space, to the console.
console.log(
  n + ' ' + c
);

/*
 * End of program.
 * This code efficiently processes words from input
 * to determine specific statistics as required.
 */