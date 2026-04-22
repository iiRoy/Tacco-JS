/*
 * This JavaScript file processes standard input to calculate and display
 * precomputed sums of prime numbers up to a certain maximum value.
 * It utilizes Node.js 'fs' module for synchronous file system operations.
 */

// Core Node.js 'fs' module is required for file system interactions.
var fs   =   require('fs'),
// Determine the size of the standard input stream.
length = fs.fstatSync ( process.stdin.fd ) .size,
// Allocate a buffer to hold the incoming data.
buffer = new Buffer(length),
// Read the standard input into the buffer synchronously.
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
// Convert the buffer to a UTF-8 string and split it by newlines to get an array of input lines.
input = buffer.toString('utf8', 0, bytesRead).split('\n');

// Immediately invoke the main processing function.
main();

/*
 * This is the primary execution block of the program.
 * It orchestrates the prime number calculation and output.
 */
function main  (  )  {
  // Pre-calculate the sums of prime numbers using the helper function.
  var primeNumbers = calcPrimeNumbers();

  // Iterate through each line of input, excluding the last empty line if present.
  for (  var i = 0, len = input.length - 1;   i < len;   i++  )  {
    // Convert the current input line to a number. The '- 0' ensures numeric conversion.
    var inp = input[i] - 0;

    // If the input is not a valid positive number (e.g., empty string or 0), skip it.
    if  (  !inp  )  {
      continue;
    }

    // Output the precomputed sum of primes up to the value specified by the current input.
    console.log ( primeNumbers[inp] ) ;
  }


}

/*
 * Calculates a list of prime numbers and their cumulative sums up to a predefined maximum.
 * It uses a modified Sieve of Eratosthenes algorithm.
 * @returns {Int32Array} An array where index 'n' contains the sum of primes up to 'n'.
 */
function calcPrimeNumbers  (  )  {
  // Define the upper limit for prime number calculation.
  var max = 10000;
  // Initialize an Int8Array to mark composite numbers. 0 for prime, 1 for composite.
  var primeNumbers = new Int8Array(max + 1);

  // Mark 0 and 1 as non-prime (composite for the purpose of the sieve).
  primeNumbers[0] = primeNumbers[1] = 1;

  // Sieve of Eratosthenes implementation.
  // Iterate from 2 up to the square root of max.
  for (  var i = 2, maxI = ~~Math.sqrt(max);   i <= maxI;   i++  )  {
    // If 'i' is already marked as composite, skip it.
    if ( primeNumbers[i] ) {
      continue;
    }

    // Mark all multiples of 'i' as composite, starting from 2*i.
    // The bit shift operator '<<1' is equivalent to multiplying by 2.
    for (  var j = (i << 1);   j <= max;   j += i  )  {
      primeNumbers[j] = 1;
    }
  }

  // Initialize an Int32Array to store the cumulative sums of prime numbers.
  var primeNums = new Int32Array(max + 1);
  // 'sum' will hold the running total of prime numbers.
  var sum = 0;
  // 'c' is an index for the 'primeNums' array, representing the current prime count.
  var c = 0;

  // Iterate from 1 to max to populate the cumulative sum array.
  for (  var i = 1;   i <= max;   i++  )  {
    // If 'i' is a prime number (not marked as composite).
    if ( !primeNumbers[i] ) {
      // Add 'i' to the current sum and store it in primeNums at index 'c'.
      // Then update 'sum' with this new total.
      sum = primeNums[c] += sum + i;
      // Increment the prime count index.
      c++;
    }
  }

  // Return the array containing cumulative sums of prime numbers.
  return primeNums;
}