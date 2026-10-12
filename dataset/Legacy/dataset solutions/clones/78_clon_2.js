// This function computes the factorial of a non-negative integer.
function calculateFactorial(numValue) {
    // Base case: factorial of 0 is 1.
    if (numValue == 0) {
        return 1;
    }
    // Recursive step: n! = n * (n-1)!
    return numValue * calculateFactorial(numValue - 1);
}

// Read raw data from the standard input file path.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Output the computed factorial of the input value to the console.
console.log(calculateFactorial(rawData));
