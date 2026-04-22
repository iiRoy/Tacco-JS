/*
 * This file contains a collection of JavaScript utility functions
 * and the main program logic for a specific problem.
 *
 * It demonstrates input parsing, array manipulation, and a recursive
 * approach to solve a computational task.
 */

// Global utility functions for type conversion.
function     pint     (   s   )   {
    return   parseInt   (   s   )   ;
}

// Converts a string 's' into a floating-point number.
function    pfloat (  s  )  {
    return  parseFloat (  s  )  ;
}

// Extending Array.prototype with custom sorting methods.

// Sorts an array of numbers in ascending order.
Array.  prototype.  sortNumAsc     =  function (   )   {
    return   this.  sort ( (  a ,   b  )   =>   ( a   -   b ) )   ;
}

// Sorts an array of numbers in descending order.
Array.prototype.sortNumDesc = function () {
    return this.sort((a, b) => (b - a));
};

// Sorts an array of strings in ascending (lexicographical) order.
Array.prototype.sortStrAsc = function () {
    return this.sort(); /* Uses default string comparison */
};

// Sorts an array of strings in descending (reverse lexicographical) order.
Array.prototype.sortStrDesc = function () {
    return this.sort().reverse(); /* Sorts then reverses */
};

// Removes all occurrences of a specific item from an array.
Array.prototype.without = function ( itm )
{
    return this.filter( ( elem ) => elem !== itm );
}


// --- Standard Input Handling ---
var input = ''; // Accumulates all incoming data from stdin.

process.stdin.resume(); /* Keeps the process alive for input */
process.stdin.setEncoding('utf8'); // Specifies the character encoding for input.

// Event listener for incoming data chunks.
process.stdin.on (   'data'  ,   chunk   =>   input   +=   chunk   )   ;

// Event listener for the end of the input stream.
process.stdin.on('end', () => {
    // Splits the accumulated input into lines, then trims whitespace from each.
    var lines = input.split('\n')
                     .map(l => l.trim());

    // If the last line is empty (common with terminal input), remove it.
    if (lines[lines.length - 1] === '') {
        lines = lines.slice(0, -1);
    }

    // Invokes the main program logic with the processed input lines.
    main(lines);
});


/**
 * The primary function that encapsulates the problem-solving logic.
 *
 * @param {string[]} lines - An array of strings, where each string represents a line of input.
 */
function main(lines) {
    // Parses the first line of input to get N and W.
    var arr = lines[0]
                .split(' ')
                .map(pint);

    var N = arr[0]; // Represents the total number of available items.
    var W = arr[1]; // Represents the maximum weight capacity.

    var V = 0; // Stores the maximum value found so far. Initialized to zero.

    // Parses the remaining lines to get item weights and values.
    // Each line after the first contains two space-separated integers: weight and value.
    lines = lines.slice(1)
                 .map(l => l.split(' ').map(pint));


    /**
     * Recursive helper function to explore combinations of items.
     * This function implements a form of backtracking or depth-first search
     * to find the optimal solution.
     *
     * @param {number} ai - The index of the current item being considered.
     * @param {number} aw - The accumulated weight of items selected in the current path.
     * @param {number} av - The accumulated value of items selected in the current path.
     * @param {number} x  - The count of items considered in the current path.
     */
    function iter(ai, aw, av, x) {
        // Base case: if 'x' (number of items considered) equals 'N' (total items),
        // it means a full path has been explored up to N items or the capacity limit.
        if (x === N) {
            console.log(V);      // Output the final maximum value.
            process.exit(0);     // Terminate the process immediately.
        }

        // Iterate through items starting from 'ai' to 'N-1'.
        for (var i = ai, l = N; i < l; i++) {
            var w = lines[i][0]; // Weight of the current item.
            var v = lines[i][1]; // Value of the current item.

            // Check if adding the current item 'w' would exceed the maximum allowed weight 'W'.
            if (w + aw <= W) {
                // If not, update the overall maximum value 'V'.
                V = Math.max(V, v + av);

                // Recursively call 'iter' to explore paths including the current item.
                // The next item to consider is 'i+1'.
                // Accumulated weight and value are updated.
                // 'x' is incremented to reflect one more item considered.
                iter(i + 1, w + aw, v + av, x + 1);
            }
        }
    }

    // Initial call to the recursive function, starting with no items, no weight, no value.
    iter(0, 0, 0, 0);

    // This line is reached if the process.exit(0) inside 'iter' is not triggered,
    // which can happen if N is 0 or if no valid combinations are found leading to a full path.
    console.log(V);
}