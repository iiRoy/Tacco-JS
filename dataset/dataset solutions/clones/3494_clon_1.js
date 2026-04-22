'use strict'; // This directive enables strict mode for the entire script.

const main = input => { // Defines the primary function named 'main', accepting 'input' as an argument.

    // Retrieves the number of data points 'n' from the first element of the input array.
    const n = parseInt(input[0]);

    // Initializes three separate arrays to store the x-coordinates, y-coordinates, and heights.
    // Each array is allocated space for 'n' elements.
    let x = new Array(n),
        y = new Array(n),
        h = new Array(n);

    // Iterates through the input data starting from the second line (index 1)
    // up to 'n' lines to populate the coordinate and height arrays.
    for (let i = 0; i < n; i++) {

        // Splits the current input line by spaces to separate x, y, and h values.
        let s = input[i + 1].split(' ');

        // Parses and assigns the x-coordinate to the 'x' array.
        x[i] = parseInt(s[0]);

        // Parses and assigns the y-coordinate to the 'y' array.
        y[i] = parseInt(s[1]);

        // Parses and assigns the height to the 'h' array.
        h[i] = parseInt(s[2]);
    }

    // The following line was commented out in the original code, and is now removed.
    // console.log(n, x, y, h);

    // Initiates a nested loop to test all possible x-coordinates for the central point.
    // The range for px is from 0 to 100, inclusive.
    for (let px = 0; px < 101; px++) {

        // Initiates another nested loop to test all possible y-coordinates for the central point.
        // The range for py is from 0 to 100, inclusive.
        for (let py = 0; py < 101; py++) {

            // Calculates a candidate height for the central point (px, py)
            // using the first data point (x[0], y[0], h[0]).
            // The formula is H = h_i + |px - x_i| + |py - y_i|.
            let height = h[0] + Math.abs(px - x[0]) + Math.abs(py - y[0]);

            // A flag variable initialized to 1 (true) to indicate a potential valid center.
            let tf = 1;

            // Iterates through the remaining data points (from index 1 to n-1)
            // to verify if the calculated 'height' is consistent with all of them.
            for (let k = 1; k < n; k++) {

                // Compares the candidate 'height' with the height derived from the current data point (k).
                // If they do not match, this (px, py) is not the correct center.
                if (height != h[k] + Math.abs(px - x[k]) + Math.abs(py - y[k])) {

                    // If a mismatch is found, set the flag to 0 (false).
                    tf = 0;
                }
            }

            // Checks if the 'tf' flag is still 1 (true) after checking all data points.
            if (tf == 1) {

                // If 'tf' is 1, the correct central coordinates (px, py) and height have been found.
                console.log(px, py, height);

                // Returns 0 to indicate successful completion and exits the 'main' function.
                return 0;

            }
        }
    }
}; // End of the 'main' function definition.

// This line reads input from standard input, decodes it as UTF-8,
// splits it into an array of strings by newline characters,
// and then passes this array to the 'main' function for processing.
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));