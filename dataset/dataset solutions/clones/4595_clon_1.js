/*
 * This file contains utility functions and a main program logic.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

/**
 * Parses a string to an integer.
 * @param {string} s - The string to parse.
 * @returns {number} The parsed integer.
 */
function pint ( s ) {
    // Using parseInt for conversion
    return parseInt(s);
}

/**
 * Parses a string to a floating-point number.
 * @param {string} s - The string to parse.
 * @returns {number} The parsed float.
 */
function pfloat(s) { return parseFloat(s); }

/**
 * Checks if a number is even.
 * @param {number} s - The number to check.
 * @returns {boolean} True if even, false otherwise.
 */
function even(s) {
    // Modulo operator checks for remainder
    return (s % 2) === 0;
}

/**
 * Checks if a number is odd.
 * @param {number} s - The number to check.
 * @returns {boolean} True if odd, false otherwise.
 */
function odd(s) {
    // If not even, it must be odd (for integers)
    return (s % 2) === 1;
}

// --- Array Prototype Extensions for Sorting ---

/**
 * Sorts an array of numbers in ascending order.
 * Modifies the array in place.
 * @returns {Array<number>} The sorted array.
 */
Array.prototype.sortNumAsc = function() {
    // Custom comparison function for numeric sort
    return this.sort((a, b) => (a - b));
};

/**
 * Sorts an array of numbers in descending order.
 * Modifies the array in place.
 * @returns {Array<number>} The sorted array.
 */
Array.prototype.sortNumDesc = function() {
    // Custom comparison function for reverse numeric sort
    return this.sort((a, b) => (b - a));
};

/**
 * Sorts an array of strings in ascending order (lexicographical).
 * Modifies the array in place.
 * @returns {Array<string>} The sorted array.
 */
Array.prototype.sortStrAsc = function() {
    // Default sort works for strings
    return this.sort();
};

/**
 * Sorts an array of strings in descending order (lexicographical).
 * Modifies the array in place.
 * @returns {Array<string>} The sorted array.
 */
Array.prototype.sortStrDesc = function() {
    // Sort then reverse for descending string order
    return this.sort().reverse();
};

/**
 * Returns a new array with all occurrences of a specified element removed.
 * Does not modify the original array.
 * @param {*} x - The element to remove.
 * @returns {Array<*>} A new array without the specified element.
 */
Array.prototype.without = function(x) {
    // Using filter to create a new array
    return this.filter(e => e !== x);
};


/**
 * Main function to process input and solve the problem.
 * @param {string[]} lines - An array of strings, where each string is a line of input.
 */
function main(lines) {
    // Parse the first line for H, W, K
    var arr = lines[0].split(' ').map(pint);
    var H = arr[0]; // Height of the stage
    var W = arr[1]; // Width of the stage
    var K = arr[2]; // Number of expansion steps

    var S = []; // Stores the current set of 'S' cells

    // Process the rest of the lines to build the stage grid
    var stage = lines.slice(1).map(l => l.split(''));

    // Find the initial 'S' cell on the stage
    outer:
    for (var h = 0; h < H; h++) {
        for (var w = 0; w < W; w++) {
            if (stage[h][w] === 'S') {
                S = [[h, w]]; // Store its coordinates
                break outer; // Exit both loops once found
            }
        }
    }

    // Perform K expansion steps
    for (var i = 0; i < K; i++) {
        var N = []; // New set of 'S' cells after this step
        // Iterate over all current 'S' cells
        for (var s = 0, l = S.length; s < l; s++) {
            var hw = S[s];
            var h = hw[0]; // Current row
            var w = hw[1]; // Current column

            var p = 4; // Represents the 4 cardinal directions (up, down, left, right)
            while (p--) {
                var nh, nw; // New coordinates

                // Determine new coordinates based on direction
                switch (p) {
                    case 3: // Up
                        nh = h - 1;
                        nw = w;
                        break;
                    case 2: // Down
                        nh = h + 1;
                        nw = w;
                        break;
                    case 1: // Left
                        nh = h;
                        nw = w - 1;
                        break;
                    case 0: // Right
                        nh = h;
                        nw = w + 1;
                        break;
                }

                // Check if the new coordinates are within bounds
                // And if the cell is traversable ('.')
                if (0 <= nh && nh < H &&
                    0 <= nw && nw < W &&
                    (stage[nh][nw] === '.')
                ) {
                    stage[nh][nw] = 'S'; // Mark new cell as 'S'
                    N.push([nh, nw]);    // Add to next iteration's 'S' cells
                }
            }
        }
        S = N; // Update 'S' for the next expansion step
    }

    var minimum = Infinity; // Initialize minimum distance to infinity

    // After K expansions, find the minimum steps from any 'S' cell to the border
    outer:
    for (var h = 0; h < H; h++) {
        for (var w = 0; w < W; w++) {
            var p = stage[h][w]; // Current cell's state
            if (p === 'S') {
                // Calculate minimum steps to reach any border from (h, w)
                var step = Math.min(w, h, W - 1 - w, H - 1 - h);

                if (step === 0) {
                    minimum = 1; // If already on a border, 1 step is needed
                    break outer; // Optimization: can't get less than 1
                }

                // Calculate steps needed for this 'S' cell to reach border
                // Math.ceil(step / K) is the number of K-step expansions needed
                // + 1 is for the initial 'S' cell itself (or the initial step to spread)
                minimum = Math.min(minimum, Math.ceil(step / K) + 1);
            }
        }
    }

    // Output the final minimum steps
    console.log(minimum);
}

// Read input, process it, and call the main function
main(
    require("fs")
        .readFileSync("/dev/stdin", "utf8") // Read from standard input
        .split('\n')                       // Split into lines
        .map(l => l.trim())                // Trim whitespace from each line
);