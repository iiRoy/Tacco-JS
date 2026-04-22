// This JavaScript program reads input from standard input, processes it line by line,
// and performs calculations based on numerical data provided. It aims to find specific
// sums of numbers within given constraints for each test case.

const input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read the entire content of standard input.

const lines = input.trim().split('\n'); // Trim leading/trailing whitespace and split the input into an array of lines.

// Loop through each line of input, treating each as a new test case until a termination condition is met.
while (line = lines.shift()) { // `lines.shift()` removes the first element from the array and returns it.

    // Parse the current line to extract two numbers: 'n' and 'max'.
    const [n, max] = line.split(' ').map(Number);

    // Check for the termination condition: if both 'n' and 'max' are zero, exit the loop.
    if (n === 0 && max === 0) {
        break; // Exit the while loop.
    }

    // Initialize an empty array to temporarily store calculated sums.
    const temp = [];

    // Read the next line, which contains a series of prices, and convert them to numbers.
    let prices = lines.shift().split(' ').map(Number);

    // Begin a nested loop structure to calculate all possible sums of two prices.
    // The outer loop iterates from 0 up to 'max' (inclusive) using index 'i'.
    for (let i = 0; i <= max; i++) {

        // The inner loop iterates from 0 up to 'n' (inclusive) using index 'j'.
        for (let j = 0; j <= n; j++) {

            // Calculate the sum of the prices at indices 'i' and 'j'.
            // If this sum is less than or equal to 'max', add it to the 'temp' array.
            if (prices[i] + prices[j] <= max) {
                temp.push(prices[i] + prices[j]); // Store the valid sum.
            }
        }
    }

    // Calculate the maximum value from the 'temp' array.
    // Note: `Math.max()` with a single argument returns that argument.
    // If `temp` is empty, `temp.length - 1` would be -1, potentially causing issues
    // if `temp` can be empty and this access is not guarded.
    const maxShits = Math.max(temp[temp.length - 1]);

    // Output the result based on two conditions:
    // 1. `temp` array must contain more than one element.
    // 2. `maxShits` must be less than or equal to `max`.
    // If both are true, print `maxShits`; otherwise, print 'NONE'.
    console.log(`${(temp.length > 1 && maxShits <= max) ? maxShits : 'NONE'}`);
}