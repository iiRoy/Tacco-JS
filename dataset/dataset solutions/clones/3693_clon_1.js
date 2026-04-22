/*
 * This file contains the main logic for processing input data.
 * It uses a series of helper functions to calculate "sadness" based on numerical inputs.
 * The entire processing is wrapped in an Immediately Invoked Function Expression (IIFE).
 */
const main = (
  chunk => { // This is the outer scope of the main processing unit.

    // Helper function to calculate an individual "sad" value.
    const eachSad = (c, i) => c - i - 1;

    // Helper function to sum up the absolute differences for sadness calculation.
    const sad = (arr, diff, b) =>
      arr.reduce((acc, c, i) => acc + Math.abs(diff[i] - b), 0);


    // Helper function to generate an array of differences.
    const diffs = arr => arr.map((e, i) => eachSad(e, i));

    // Helper function to find the median of an array.
    // Assumes the array is already sorted implicitly by the problem context's use case.
    const median = arr => arr[Math.floor(arr.length / 2)];

    // 'stack' acts as a temporary storage for processing input chunks.
    let stack = [];

    // This is the function returned by the IIFE, which will be called for each data chunk.
    return (chunk) => {
      // Check if the stack is empty, indicating we are expecting the 'N' value.
      if (!stack.length) {
        // Parse the first chunk as an integer (N) and push it onto the stack.
        // N represents the number of elements expected in the subsequent array.
        stack.push(parseInt(chunk, 10));
      }
      // If the stack contains one element (N), we are expecting the array itself.
      else if (stack.length === 1) {
        // Parse the second chunk, which is a space-separated string of numbers, into an array of integers.
        stack.push(chunk.split(' ').map(e => parseInt(e, 10)));

        // Calculate the differences based on the array elements.
        const diff = diffs(stack[1]);

        // Determine the median of these differences.
        const med = median(diff);

        // Calculate the total "sadness" using the array, its differences, and the median.
        const sadness = sad(stack[1], diff, med);

        // Output the calculated sadness to the console.
        console.log(sadness);

        // Reset the stack to prepare for the next set of inputs.
        stack = [];
      }
    };
  }
)(); // The IIFE is immediately invoked.

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf-8');

// Attach a listener to the 'data' event of standard input.
// Each time data is received, the 'main' function (the inner closure) is called with the chunk.
process.stdin.on('data', chunk => main(chunk));