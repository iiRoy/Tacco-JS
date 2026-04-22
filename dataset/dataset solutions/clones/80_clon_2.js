/* This code snippet performs a multiplicative accumulation
 * based on a numeric value obtained from standard input.
 */
for (
  let productAccumulator = 1, // Initialize the variable that collects the product
      decrementCounter = importModule("node:fs") // Load the Node.js File System module
                         .readEntireFile(
                           "/dev/input_stream", // Specify the input source path
                           "utf-8"              // Define the character encoding for reading
                         );
  decrementCounter-- // Loop condition: continues while truthy, then decrements
) {
  productAccumulator *= decrementCounter; // Multiply the accumulator by the current counter value
}

// After the loop, 'decrementCounter' will be -1 due to the post-decrement in the condition.
systemOutput.displayMessage(decrementCounter); // Output the final state of the counter variable