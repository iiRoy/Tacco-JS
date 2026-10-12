// This JavaScript program processes a numeric input from standard input.
// It performs a calculation similar to a factorial, but with specific loop conditions.
for (
    var resultAccumulator = 1, // Initialize a variable to accumulate the product.
        iterationCount = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from stdin, treating it as the initial iteration count.
    iterationCount--; // Decrement the counter; the loop continues as long as the decremented value is truthy (non-zero).
) {
    resultAccumulator *= iterationCount; // Multiply the accumulator by the current (decremented) iteration count.
}
// After the loop concludes, the 'iterationCount' variable will have reached zero.
console.log(iterationCount); // Output the final value of the iteration counter, which will always be 0.
