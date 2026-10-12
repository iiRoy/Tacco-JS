// This function determines if a given integer is a prime number.
function checkIfPrime(inputNumber) {
    // Handle base cases for small prime numbers.
    // Numbers 2 and 3 are prime.
    if (inputNumber == 2 || inputNumber == 3) {
        return true;
    }

    // Numbers less than 2 are not prime.
    // Even numbers (except 2) are not prime.
    // Multiples of 3 (except 3) are not prime.
    if (inputNumber < 2 || inputNumber % 2 == 0 || inputNumber % 3 == 0) {
        return false;
    }

    // Calculate the square root of the number.
    // We only need to check for divisors up to this limit for efficiency.
    var limitValue = Math.floor(Math.sqrt(inputNumber));

    // Optimized loop for checking primality using the 6k ± 1 rule.
    // All prime numbers greater than 3 can be expressed in the form 6k - 1 or 6k + 1.
    for (var iterator = 1; (iterator * 6) - 1 <= limitValue; iterator++) {
        // Check if the input number is divisible by (6k - 1) or (6k + 1).
        if (inputNumber % ((iterator * 6) - 1) == 0 || inputNumber % ((iterator * 6) + 1) == 0) {
            // If a divisor is found, the number is not prime.
            return false;
        }
    }

    // If no divisors were found throughout the checks, the number is prime.
    return true;
}

// Resume the standard input stream to start listening for data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener to process incoming data chunks from standard input.
process.stdin.on('data', function (dataBlock) {
    // Split the received data chunk into an array of individual lines.
    var inputLines = dataBlock.split('\n');

    // Remove the first line from the array. This is often a count or header line
    // that is not part of the numbers to be processed.
    inputLines.shift();

    // Filter the remaining lines:
    // For each line, the checkIfPrime function is called. JavaScript's type coercion
    // will convert the string line to a number for the arithmetic operations within checkIfPrime.
    // The filter method keeps only those lines for which checkIfPrime returns true.
    // Finally, the length of the filtered array (count of prime numbers) is logged to the console.
    console.log(inputLines.filter(checkIfPrime).length);
});
