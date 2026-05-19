var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineData = (rawData.trim()).split("\n"); // Split input into lines, removing leading/trailing whitespace

// Initialize a dynamic programming array for a modified Fibonacci-like sequence
var fibonacciLikeSequence = [1, 2, 4];

// Populate the sequence up to index 31
for (var idx = 3; idx <= 31; idx++) {
    fibonacciLikeSequence[idx] = fibonacciLikeSequence[idx - 1] + fibonacciLikeSequence[idx - 2] + fibonacciLikeSequence[idx - 3];
}

// Process input lines until a zero is encountered
while (true) {
    // Get the next number from the input array and convert it to a numeric type
    var currentValue = +lineData.shift();

    // If the current value is 0, terminate the loop
    if (currentValue === 0) {
        break;
    }

    // Calculate and print the ceiling of (sequence_value / 3650)
    console.log(Math.ceil(fibonacciLikeSequence[currentValue - 1] / 3650));
}
