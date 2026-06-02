var outputFunc = console.log; // A function reference for logging output.

// This block handles standard input (stdin) in a Node.js environment.
if (typeof process !== "undefined") {
    let dataBuffer = ""; // A string to accumulate all incoming data chunks.
    process.stdin.resume(); // Ensures the standard input stream is active.
    process.stdin.setEncoding('utf8'); // Sets the character encoding for the input.

    // Event listener for when data chunks are received from stdin.
    process.stdin.on('data', function (dataPiece) {
        dataBuffer += dataPiece; // Appends the current data chunk to the buffer.
    });

    // Event listener for when the standard input stream ends.
    process.stdin.on('end', function () {
        // Splits the accumulated data into an array of strings, using newline as a delimiter.
        const inputLines = dataBuffer.split("\n");
        // Invokes the primary processing function with the collected input lines.
        processInputAndCompute(inputLines);
    });
}

// A constant representing a large prime number used for modulo operations.
const primeModulo = 1000000007;

/**
 * Computes (baseVal ^ exponentVal) % primeModulo efficiently using modular exponentiation (exponentiation by squaring).
 * This recursive function reduces the number of multiplications required.
 *
 * @param {number} baseVal - The base number for the exponentiation.
 * @param {number} exponentVal - The exponent.
 * @returns {number} The result of the modular exponentiation.
 */
function calculatePowerModulo(baseVal, exponentVal) {
    // Base cases for small exponents to prevent excessive recursion.
    if (exponentVal <= 3) {
        return Math.pow(baseVal, exponentVal) % primeModulo;
    }

    // If the exponent is an even number.
    if (exponentVal % 2 === 0) {
        // Apply the property: (a^b)^2 = a^(2b).
        // Calculate (baseVal ^ (exponentVal/2)) % primeModulo, then square the result.
        return Math.pow(calculatePowerModulo(baseVal, exponentVal / 2), 2) % primeModulo;
    } else {
        // If the exponent is an odd number.
        // Apply the property: a^(2b+1) = a * (a^b)^2.
        // Calculate (baseVal ^ ((exponentVal-1)/2)) % primeModulo, square it, then multiply by baseVal.
        return (Math.pow(calculatePowerModulo(baseVal, (exponentVal - 1) / 2), 2) * baseVal) % primeModulo;
    }
}

/**
 * The main entry point for processing the input data and orchestrating the calculation.
 * It parses the input, calls the modular exponentiation function, and outputs the final result.
 *
 * @param {string[]} inputDataRows - An array where each element is a line of input from stdin.
 */
function processInputAndCompute(inputDataRows) {
    // Retrieves the very first line from the input array.
    let firstRow = inputDataRows[0];
    // Splits the first line by spaces and converts each resulting string part into a number.
    const parsedNumbers = firstRow.split(" ").map(function (elementStr) {
        return Number(elementStr); // Converts the string element to a numeric type.
    });
    // Calls the modular exponentiation function with the two parsed numbers and prints the outcome.
    outputFunc(calculatePowerModulo(parsedNumbers[0], parsedNumbers[1]));
}
