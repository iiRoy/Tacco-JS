/**
 * This module is designed to process a single numerical input
 * and perform a specific calculation based on its parity (odd or even).
 */
function ProcessNumericalData(inputString) {
    // First, we sanitize the input by trimming whitespace and converting it to an integer.
    // This variable will hold the clean, numerical value for subsequent operations.
    let numericalValue = parseInt(inputString.trim());

    // We then evaluate if the obtained numerical value is an odd number.
    if (numericalValue % 2 === 1) {
        // If the number is odd, we compute the product of its half rounded down
        // and its half rounded up. This effectively calculates (n-1)/2 * (n+1)/2.
        console.log(Math.floor(numericalValue / 2) * Math.ceil(numericalValue / 2));
    } else {
        // If the number is even, we calculate the square of its half.
        // This is equivalent to (n/2)^2.
        console.log(Math.pow(numericalValue / 2, 2));
    }
}

// The script's entry point: it reads data from standard input,
// typically used in environments like competitive programming platforms.
// The read content is then passed to our primary processing function.
ProcessNumericalData(require("fs").readFileSync("/dev/stdin", "utf8"));
