/*
 * This file contains a JavaScript program designed to
 * process a string by shifting its characters based on a given key.
 * The core logic involves character manipulation and recursion.
 */

// Define a utility function named 'range'.
// This function generates an array of numbers within a specified range [s, e].
// For example, range(0, 2) would return [0, 1, 2].
const range = (s, e) =>
  Array(e - s + 1) // Create an array with the correct length.
    .fill(0) // Fill it with dummy values (0s).
    .map((v, i) => i + s); // Map each index 'i' to 'i + s' to get the desired range.

/*
 * Create an array named 'alphabets'.
 * This array will store all lowercase English alphabet characters from 'a' to 'z'.
 * It uses the 'range' function to generate numbers from 0 to 25,
 * then maps each number 'v' to its corresponding ASCII character
 * by adding 'v' to the ASCII code of 'a' (which is 97).
 */
const alphabets = range(0, 25)
  .map(
    v =>
      String.fromCodePoint(
        97 + v
      ) /* Convert the numeric code point to a character */
  );


/**
 * The main processing function.
 * It takes a string 's', an integer key 'K', and an accumulated 'top' string.
 * This function recursively shifts characters in 's' based on 'K'.
 *
 * @param {string} s   - The input string to be processed.
 * @param {number} K   - The shifting key.
 * @param {string} top - The accumulated string of processed characters (defaults to empty string).
 * @returns {string}   - The processed string.
 */
const process = (s, K, top) => {
  // Initialize 'top' to an empty string if it's not provided.
  top = top || "";

  // Base case 1: If the key 'K' becomes 0 or the string 's' is empty,
  // append the remaining 's' (if any) to 'top' and return.
  if (K === 0 || !s) {
    return top + s;
  }

  // Base case 2: If the first character of 's' is 'a',
  // it cannot be shifted further down. Append 'a' to 'top'
  // and recursively call 'process' with the rest of the string.
  if (s[0] === "a") {
    return process(s.slice(1), K, top + s[0]);
  }

  // Find the index of the first character of 's' in the 'alphabets' array.
  // This 'i' represents its position (0 for 'a', 1 for 'b', etc.).
  var i = alphabets.findIndex(v => v === s[0]);

  // Check if the remaining shift needed to reach 'a' (which is 'i')
  // is less than or equal to the available key 'K'.
  // '26 - i' is not correct here, it should be just 'i' to reach 'a' from current char.
  // The expression '26 - i <= K' seems to be checking if K is large enough to wrap around multiple times.
  // If 'i' (the shift needed to reach 'a') is less than or equal to 'K',
  // then we can shift the character to 'a' and potentially use up some 'K'.
  // The logic 'K - 26 + i' implies a wrap-around, where '26 - i' is the shift from 'a' to 's[0]'.
  // If we shift 's[0]' to 'a', we use 'i' amount of K.
  // The '26 - i' part implies shifting *from* 'a' *to* 's[0]'.
  // The original code uses '26 - i <= K' which would mean if there's enough K to shift it from 's[0]' to 'a'
  // AND then potentially wrap around by 26 characters.
  // Let's assume the original logic is correct here for Type I clone.
  if (26 - i <= K) {
    // Shift 's[0]' to 'a', update K, and recurse.
    return process(s.slice(1), K - (26 - i), top + "a");
  } else {
    // If 'K' is not large enough to shift to 'a' or wrap around,
    // then we apply the remaining 'K' directly to the current character.
    // This will shift 's[0]' by 'K' positions.
    // If it's the last character, directly append the shifted character and the rest of 's' (which is empty).
    // Otherwise, recurse with the rest of 's', applying the shift to 's[0]'.
    return s.length === 1 ?
      top + alphabets[i + K] + s.slice(1) : // If last character, append shifted character.
      process(s.slice(1), K, top + alphabets[i + K]); // Recursively process the rest.
  }
};


/*
 * This is the entry point function for the program.
 * It takes the entire input data as a single string.
 */
function Main(input) {
  // Declare variables to hold the input string 's', the key 'K', and a temporary reference.
  var s, K, ref;

  // Split the input string by newline to separate 's' and 'K'.
  // The first line is the string 's', and the second line is the key 'K'.
  ref = input.split("\n"),
    s = ref[0],
    K = parseInt(ref[1]); // Parse 'K' as an integer.

  // Call the 'process' function with the extracted 's' and 'K',
  // and print the result to the console.
  console.log(process(s, K));
}

/*
 * ********************************************************************************
 * This section handles standard input/output and should not be modified.
 * It reads all input from stdin and passes it to the 'Main' function.
 * ********************************************************************************
 */
Main(
  require("fs")
  .readFileSync("/dev/stdin", "utf8")
); // Read input from standard input as UTF-8.