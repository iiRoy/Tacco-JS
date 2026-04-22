// This script reads input from stdin, processes words,
// and outputs the most frequent word's index (n) and the longest word (c).

a = [],
m = l = n = c = 0; // Initialize variables: a for frequency map, m for max frequency, l for max length, n for most frequent word index, c for longest word.

/*
 * Reads the entire content of standard input synchronously.
 * The input is assumed to be a sequence of words separated by spaces.
 * The 'utf8' encoding is used for reading the file.
 */
require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split(' ') // Split the input string into an array of words using space as a delimiter.
  .map(
    // Iterate over each word in the array.
    function(i) {
      /*
       * Logic to count word frequencies and track the most frequent word.
       * 'a' acts as a frequency map where keys are words and values are counts.
       */
      a[i]
        ? // If the word 'i' already exists in our frequency map 'a'
          ++a[i] > m
          ? // Increment its count and check if the new count is greater than the current maximum frequency 'm'
            (m = a[n = i]) // If it is, update 'm' to the new max frequency and 'n' to the current word 'i' (which is the index of the most frequent word).
          : 0 // Otherwise, do nothing (keep current 'm' and 'n').
        : // If the word 'i' does not exist in 'a'
          (a[i] = 1); // Initialize its count to 1.

      /*
       * Logic to find the longest word.
       * 't' temporarily stores the length of the current word.
       * 'l' stores the maximum length found so far.
       * 'c' stores the longest word itself.
       */
      (t = i.length) > l // Calculate the length of the current word 'i' and assign it to 't'. Then, compare 't' with the current maximum length 'l'.
        ? // If 't' is greater than 'l'
          ((c = i), (l = t)) // Update 'c' to the current word 'i' and 'l' to its length 't'.
        : // Otherwise
          0; // Do nothing.
    }
  );

// Finally, print the most frequent word's index (n) and the longest word (c), separated by a space.
console.log(n + ' ' + c);