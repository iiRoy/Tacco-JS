/*
 * This JavaScript file contains functions and logic
 * to process numerical input from standard input.
 * The primary goal is to find prime numbers and
 * determine the closest prime neighbors for each input number.
 */

// Function definition for 'isPrime': Determines if a given number 'num' is prime.
// A prime number is a natural number greater than 1 that has no positive divisors
// other than 1 and itself.
function isPrime(num) {
  // Handle edge cases for the smallest prime numbers directly.
  // The numbers 2 and 3 are prime.
  if (num == 2 || num == 3)
    return true; // If 'num' is 2 or 3, it's definitely prime.

  // Eliminate numbers that are obviously not prime:
  // 1. Numbers less than 2 (0, 1, negative numbers).
  // 2. Even numbers greater than 2.
  // 3. Multiples of 3 greater than 3.
  if (num < 2 || num % 2 == 0 || num % 3 == 0)
    return false; // These numbers are not prime.

  // Optimization: Divisors only need to be checked up to the square root of 'num'.
  // 'Math.round' is used here to ensure 'limit' is an integer.
  var limit = Math.round(Math.sqrt(num));

  // Loop using an optimized primality test based on the 6k ± 1 rule.
  // All prime numbers greater than 3 can be expressed in the form 6k - 1 or 6k + 1.
  var i = 1;
  while (i * 6 - 1 <= limit) {
    // Check for divisibility by numbers of the form (6*i - 1) and (6*i + 1).
    if (num % (i * 6 - 1) == 0 || num % (i * 6 + 1) == 0)
      return false; // If 'num' is divisible by either, it's not prime.

    // Increment 'i' to check the next pair of potential prime factors.
    i++;
  }

  // If the number passes all checks, it is considered prime.
  return true;
} // End of the 'isPrime' function.

// --- Main program execution begins here ---

// Utilize the Node.js 'fs' (file system) module to read input.
// 'readFileSync' is used for synchronous reading from '/dev/stdin',
// which represents standard input. The input is read as 'utf8' encoded text.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string:
// 1. '.trim()' removes any leading or trailing whitespace.
// 2. '.split('\n')' divides the string into an array of substrings,
//    using the newline character as a delimiter. Each element in 'lines'
//    will be a single line from the input.
var lines = input.trim().split('\n');

// Declare a variable 'line' which will temporarily hold each line
// as it is processed from the 'lines' array.
var line;

// Loop through each line obtained from the standard input.
// 'lines.shift()' removes the first element from the 'lines' array
// and assigns it to 'line', continuing until 'lines' is empty.
while (line = lines.shift()) {
  // Convert the current 'line' (which is a string) into a numerical value.
  // The unary plus operator (+) is a concise way to perform this type conversion.
  var num = +line;

  // Declare variables to store the "most previous" prime (mp)
  // and the "least next" prime (lp) relative to the input 'num'.
  var mp; // Represents the largest prime number strictly less than 'num'.
  var lp; // Represents the smallest prime number strictly greater than 'num'.

  // Special handling for the number 3:
  // If 'num' is 3, its immediately preceding prime is 2.
  if (num == 3)
    mp = 2; // Assign 2 to 'mp' for this specific case.

  // Initialize a counter 'i' for searching primes.
  // We start from 3 because 2 is often handled as a special case,
  // and we will increment 'i' by 2 to only check odd numbers.
  var i = 3;

  // An infinite loop designed to find both 'mp' and 'lp'.
  // The loop will explicitly break once 'lp' is found.
  while (true) {
    // Check if the current number 'i' is prime and is also less than the input 'num'.
    // If true, 'i' becomes a candidate for 'mp'. Since we are incrementing 'i',
    // 'mp' will continuously be updated to the largest prime found so far that is less than 'num'.
    if (isPrime(i) && i < num)
      mp = i;

    // Check if the current number 'i' is prime and is greater than the input 'num'.
    // If true, this 'i' is the smallest prime greater than 'num' that we have encountered.
    if (isPrime(i) && i > num) {
      lp = i; // Assign 'i' to 'lp'.
      break; // Both 'mp' and 'lp' for the current 'num' have been found, so exit the loop.
    }

    // Increment 'i' by 2 to efficiently check only odd numbers.
    // This skips all even numbers (except 2, which is handled separately or in base cases).
    i += 2;
  }

  // After finding 'mp' and 'lp' for the current 'num', print them to the console.
  // The values will be separated by a space as per default 'console.log' behavior.
  console.log(mp, lp);
}
// End of the main program loop.