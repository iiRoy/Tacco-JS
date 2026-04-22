/*
 * This file contains a JavaScript program that processes an array based on
 * a given number of iterations. It demonstrates basic array manipulation,
 * conditional logic, and function calls.
 */

// Declare a global variable to store the array, which will be initialized later.
var abk;

/**
 * Performs an operation on two elements of the global 'abk' array.
 * Specifically, it modifies abk[a] and then updates abk[b] based on the modified abk[a].
 *
 * @param {number} a - The index of the first element to process.
 * @param {number} b - The index of the second element to process.
 */
function ex(a, b) {

  // Check if the element at index 'a' is an odd number.
  if (abk[a] % 2 == 1) {
    // If it is odd, decrement it by one to make it an even number.
    --abk[a];
  }

  // Divide the element at index 'a' by two.
  abk[a] /= 2;

  // Add the (now modified) value of abk[a] to the element at index 'b'.
  abk[b] += abk[a];

}


/**
 * The main function that orchestrates the program's logic.
 * It reads input, initializes the 'abk' array, performs iterations,
 * and prints the final state of the first two elements of 'abk'.
 *
 * @param {string} input - The raw input string from standard input.
 */
function Main(input) {

  // Parse the input string to initialize the global 'abk' array.
  // This involves taking the first line, splitting it by whitespace,
  // and then converting each resulting string segment into a number.
  abk = input
    .split("\n")[0] // Get the first line of the input string.
    .split(/\s/)    // Split the first line by any whitespace characters.
    .map(function(value) {
      // Convert each string value obtained from splitting into a number.
      // Subtracting 0 is a common idiom for type coercion to number.
      return value - 0;
    });


  // Extract the iteration count 'K' from the third element (index 2)
  // of the newly initialized 'abk' array.
  var K = abk[2];


  // Loop 'K' times to perform a series of operations on the 'abk' array.
  // The loop counter 'n' goes from 1 up to and including K.
  for (var n = 1; n <= K; n++) {

    // Check if the current iteration number 'n' is an odd number.
    if (n % 2 == 1) {
      // If 'n' is odd, call the 'ex' function with indices 0 and 1.
      ex(0, 1);
    } else {
      // If 'n' is even, call the 'ex' function with indices 1 and 0.
      ex(1, 0);
    }

  }


  // Print the final values of the first two elements (at indices 0 and 1)
  // of the 'abk' array to the console, formatted as two decimal integers.
  console.log('%d %d', abk[0], abk[1]);

}


// This line handles reading input from standard input (stdin) and
// passing it to the 'Main' function. It uses Node.js's 'fs' module
// to read the entire file synchronously and encodes it as UTF-8.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));