// This section handles standard input operations for the script.
// It reads the entire content of standard input into a buffer.

var fs = require('fs'), // File system module for synchronous operations.

    length = fs.fstatSync(process.stdin.fd).size, // Determine the size of the input stream.

    buffer = new Buffer(length), // Create a buffer of the determined size to hold input data.

    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0), // Read data from stdin into the buffer.

    input = buffer.toString('utf8', 0, bytesRead).split('\n'); // Convert buffer to UTF-8 string, then split by newlines.

main(); // Call the primary function to begin program execution.





// --------------------------------------------------------------------------------------------------
// Main program logic starts here.
// --------------------------------------------------------------------------------------------------
function main() {

    // Pre-calculate prime numbers up to a certain limit to efficiently answer queries.
    var primeNumbers = calcPrimeNumbers();

    // Iterate through each line of input, excluding the last one if it's empty.
    for (var i = 0, len = input.length - 1; i < len; i++) {

        // Convert the current input line to a number.
        var inp = input[i] - 0;

        // If the input is zero or falsy, it signifies the end of input or an invalid input,
        // so terminate the program.
        if (!inp) {

            return; // Exit the main function.
        }


        // Output the pre-calculated sum of primes up to the 'inp'-th prime.
        console.log(primeNumbers[inp]);
    }


} // End of main function.




// --------------------------------------------------------------------------------------------------
// Function to calculate sums related to prime numbers using a Sieve-like approach.
// --------------------------------------------------------------------------------------------------
function calcPrimeNumbers() {

    // Define the maximum number to check for primality. This is a constant value.
    var max = 104729;

    // Initialize an Int8Array to mark numbers as prime (0) or composite (1).
    // Using Int8Array for memory efficiency as values are only 0 or 1.
    var primeNumbers = new Int8Array(max + 1);


    // Mark 0 and 1 as not prime (they are special cases).
    primeNumbers[0] = primeNumbers[1] = 1;

    // Sieve of Eratosthenes implementation:
    // Iterate from 2 up to the square root of max.
    for (var i = 2, maxI = ~~Math.sqrt(max); i <= maxI; i++) {

        // If 'i' is already marked as composite, skip it.
        if (primeNumbers[i]) {

            continue; // Move to the next number.
        }


        // If 'i' is prime, mark all its multiples as composite.
        // Start from i*i (or i*2, which is i<<1) as smaller multiples would have been marked already.
        for (var j = (i << 1); j <= max; j += i) {
            primeNumbers[j] = 1; // Mark 'j' as composite.
        }
    }


    // Now, calculate the cumulative sum of prime numbers.
    // primeNums will store the sum of primes up to the N-th prime.
    var primeNums = new Int32Array(max + 1);

    var sum = 0; // Accumulator for the current sum of primes.

    var c = 0; // Counter for the N-th prime.

    // Iterate from 1 to max to find primes and calculate their cumulative sums.
    for (var i = 1; i <= max; i++) {

        // If primeNumbers[i] is 0, it means 'i' is a prime number.
        if (!primeNumbers[i]) {

            // Increment prime counter 'c', add 'i' to the current sum, and store it.
            // The value at primeNums[c] will be the sum of the first 'c' prime numbers.
            sum = primeNums[++c] += sum + i;
        }
    }


    return primeNums; // Return the array containing cumulative sums of primes.
} // End of calcPrimeNumbers function.