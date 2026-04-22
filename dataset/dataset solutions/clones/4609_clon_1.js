/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It includes utility functions and a main logic flow.
 */

// Utility function to parse a string into an integer.
// This function is a wrapper around the native parseInt.
function    pint(s)   {
    return  parseInt(s);
}

// Utility function to parse a string into a floating-point number.
// This function is a wrapper around the native parseFloat.
function pfloat(s)
{
    return  parseFloat(s);
}

/*
 * Extending Array.prototype with custom sorting and utility methods.
 * These methods provide convenient ways to manipulate arrays.
 */

// Sorts an array of numbers in ascending order.
Array.prototype.sortNumAsc  = function ()
{
    return this.sort((a, b) => (a - b));
}

// Sorts an array of numbers in descending order.
Array.prototype.sortNumDesc = function ()
{
    return this.sort((a, b) => (b - a));
}

// Sorts an array of strings in ascending (lexicographical) order.
Array.prototype.sortStrAsc  = function ()
{
    return  this.sort();
}

// Sorts an array of strings in descending (reverse lexicographical) order.
Array.prototype.sortStrDesc = function ()
{
    return  this.sort().reverse();
}

// Returns a new array with all occurrences of a specified item removed.
Array.prototype.without = function (itm)
{
    return this.filter((elem) => elem !== itm);
}


// Variable to store all incoming data from standard input.
var input = '';

// Resume standard input stream to start receiving data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
// Each chunk is appended to the 'input' string.
process.stdin.on('data', chunk =>
{
    input += chunk;
});

// Event listener for the 'end' of the standard input stream.
// This is where the main processing logic begins after all input is received.
process.stdin.on('end', () =>
{
    // Split the input string into an array of lines.
    // Each line is then trimmed of leading/trailing whitespace.
    var lines = input.split('\n').map(l => l.trim());

    // If the last line is empty, remove it.
    if (lines[lines.length-1] === '') {
        lines = lines.slice(0, -1);
    }

    // Call the main function with the processed lines.
    main(lines);
});


// The primary logic function that processes the input lines.
function main(lines)
{
    // Parse the first line to get N and W.
    // N: number of items, W: maximum weight capacity.
    var arr = lines[0].split(' ').map(pint);
    var N   = arr[0];
    var W   = arr[1];

    // Initialize V (maximum value) to 0.
    var V   = 0;

    // Process the remaining lines, converting them into arrays of integers
    // representing item weights and values.
    lines = lines.slice(1).map(l => l.split(' ').map(pint));

    // Recursive helper function for exploring combinations of items.
    // ai: current item index
    // aw: accumulated weight
    // av: accumulated value
    function iter(ai, aw, av)
    {
        // Base case: If all items have been considered.
        if (ai === N) {
            // Output the current maximum value and terminate the process.
            console.log(V);
            process.exit();
        }

        // Iterate through the remaining items starting from 'ai'.
        for (var i = ai, l = N; i < l; i++) {
            // Extract weight (w) and value (v) of the current item.
            var w = lines[i][0];
            var v = lines[i][1];

            // Check if adding the current item's weight does not exceed the capacity W.
            if (w + aw <= W) {
                // Update the maximum value found so far.
                V = Math.max(V, v + av);

                // Recursively call iter with the next item, updated weight, and updated value.
                iter(i+1, w + aw, v + av);
            }
        }
    }

    // Initial call to the recursive iterator, starting with no items, zero weight, and zero value.
    iter(0, 0, 0);

    // If the process reaches here, it means no exit was triggered inside 'iter'
    // (e.g., if N was 0 from the start or no valid path led to a full N).
    // This line prints the final maximum value.
    console.log(V);
}