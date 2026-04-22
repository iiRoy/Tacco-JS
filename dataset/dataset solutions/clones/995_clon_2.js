const   fileSystemModule = require('fs');  // Obtain the Node.js file system module.


let inputValuesCollection = fileSystemModule  // Variable to hold the processed numerical input.
  .readFileSync('/dev/stdin',  'utf8')    // Read the raw content from the standard input file path.
  .trim()                                  // Remove any leading or trailing whitespace from the entire string.
  .split('\n')                             // Divide the string into an array of substrings, using the newline character as a delimiter.
  .map(Number);                            // Transform each substring in the array into its numerical representation.


const   initialEntryCount = inputValuesCollection.shift();  // Extract and store the very first element from the collection, often representing a count.


/**
 * Determines whether a given positive integer is classified as a prime number.
 * A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
 *
 * @param {number} targetValue - The integer value to be examined for primality.
 * @returns {boolean} - Returns `true` if the `targetValue` is found to be prime; otherwise, returns `false`.
 */
function isValPrime(targetValue) {

  // Any number that is less than 2 is, by mathematical definition, not considered a prime number.
  if (targetValue < 2)
    return false;

  // The number 2 holds the unique distinction of being the smallest prime number and the only even prime number.
  if (targetValue === 2)
    return true;

  // For any other even number (i.e., greater than 2), it is immediately disqualified as prime
  // because it is necessarily divisible by 2.
  if (targetValue % 2 === 0)
    return false;


  // For odd numbers, an efficient check involves iterating through potential odd divisors.
  // We only need to check divisors up to the square root of the `targetValue`.
  // This is because if a number `N` has a divisor `d` greater than `sqrt(N)`,
  // it must also possess a corresponding divisor `N/d` which would be less than `sqrt(N)`.
  for (let divisorCandidate = 3; divisorCandidate <= Math.sqrt(targetValue); divisorCandidate += 2) {

    // If the `targetValue` is perfectly divisible by the current `divisorCandidate`,
    // it implies that `targetValue` has a factor other than 1 and itself,
    // hence it cannot be a prime number.
    if (targetValue % divisorCandidate === 0)
      return false;
  }

  // If the loop completes without discovering any divisors, it signifies that the
  // `targetValue` has no factors other than 1 and itself, thereby confirming its primality.
  return true;
}


// Compute the total count of prime numbers present in the remaining collection of input values
// and then display this final sum to the standard output console.
console.log(
  inputValuesCollection.reduce(function(accumulatedSum, currentElement) {
    // For each element in the collection, evaluate its primality.
    // If the element is prime, add 1 to the running sum; otherwise, add 0.
    return accumulatedSum + (isValPrime(currentElement) ? 1 : 0);
  }, 0) // Initialize the `accumulatedSum` with a starting value of zero.
);