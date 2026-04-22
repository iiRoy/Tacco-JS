/*
 * This JavaScript file processes input lines to calculate a specific value.
 * It uses the 'readline' module for standard input/output operations.
 */

// Initialize an empty array to store input lines.
var lines  =  [];

// Import the 'readline' module, which provides an interface for reading data from a Readable stream
// (such as process.stdin) one line at a time.
var readline = require('readline');

// Create an interface for reading lines from the standard input and writing to the standard output.
var rl = readline.createInterface(
 {
     // Specify the input stream as standard input.
     input: process.stdin,

     // Specify the output stream as standard output.
     output: process.stdout
 }
);


// Event listener for each line of input received.
// When a line is entered by the user, this function will be executed.
rl.on('line', function (x) {
    // Add the received line (x) to the 'lines' array.
    lines.push(x);
});


// Event listener for the 'close' event, which is emitted when the input stream ends (e.g., Ctrl+D or end of file).
rl.on('close', function () {

    // Parse the first number from the first line of input.
    // The first line is expected to contain two space-separated numbers.
    var N = Number(lines[0].split(" ")[0]);

    // Parse the second number from the first line of input.
    var K = Number(lines[0].split(" ")[1]);

    // Remove the first line from the 'lines' array, as N and K have been extracted.
    lines.shift();


    // Convert the remaining lines into an array of numbers.
    // Each line is expected to contain a single number.
    var h = lines.map(value => Number(value));


    // Sort the array 'h' in ascending order.
    // This is a comparison function for numerical sorting.
    // 昇順ソートを実行します。
    h.sort((a, b) => a - b);


    // Initialize 'result' with a very large value (Infinity) to ensure any valid difference will be smaller.
    var result = Infinity;


    // Iterate through the sorted array 'h' to find the minimum difference.
    // The loop runs from the first element up to an index that allows for 'K' elements ahead.
    for (var i = 0; i < h.length; i++) {
        // Check if the current window of K elements is valid (i.e., h[i + K - 1] exists).
        // This implicitly handles the loop boundary.
        if ( (i + K - 1) < h.length )
        {
            // Calculate the difference between the K-th element and the current element.
            var currentDifference = h[i + K - 1] - h[i];

            // If this difference is smaller than the current 'result', update 'result'.
            if (result > currentDifference) {
                result = currentDifference;
            }
        }
    }

    // Output the final calculated minimum difference to the console.
    console.log(result);
});