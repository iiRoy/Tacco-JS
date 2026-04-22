// Enable strict mode for better error handling and cleaner code.
'use strict';

/**
 * Main function to solve the problem.
 * It reads input, processes a grid, and determines if a specific condition is met.
 * @param {string} s - The input string containing grid dimensions and the grid content.
 */
function main(s) {

    // Split the input string into an array of lines.
    s = s.split('\n');

    // Parse grid dimensions from the first line of the input.
    // H represents the height (number of rows) of the grid.
    const H = Number(s[0].split(' ')[0]);
    // W represents the width (number of columns) of the grid.
    const W = Number(s[0].split(' ')[1]);

    // Extract the grid data.
    // We slice from the second line (index 1) to the second to last line (index -1)
    // to exclude the dimension line and a potential trailing empty line.
    // Each line is then split into an array of individual characters.
    const table = s.slice(1, -1).map(line => line.split(''));

    // Define displacement vectors for checking 4-directional neighbors (up, right, down, left).
    // dh: change in height (row index) for neighbors.
    const dh = [-1, 0, 1, 0];
    // dw: change in width (column index) for neighbors.
    const dw = [0, 1, 0, -1];

    // Initialize the answer as 'Yes'. This variable will be updated to 'No'
    // if any '#' cell does not meet the specified condition.
    let answer = 'Yes';

    // Iterate over each cell in the grid using nested loops.
    // The outer loop iterates through each row from 0 to H-1.
    for (let h = 0; h < H; h++) {
        // The inner loop iterates through each column from 0 to W-1.
        for (let w = 0; w < W; w++) {
            // If the current cell contains a '.' (empty space),
            // we skip it as it does not participate in the condition check.
            if (table[h][w] === '.') continue;

            // Initialize a counter to keep track of adjacent '#' cells for the current cell.
            let count = 0;

            // Check all four potential neighbors (up, right, down, left).
            for (let d = 0; d < 4; d++) {
                // Calculate the coordinates of the neighbor cell.
                const nh = h + dh[d];
                const nw = w + dw[d];

                // Check if the neighbor's height coordinate is out of bounds.
                // If it is, this neighbor is invalid, so we skip to the next direction.
                if (nh < 0 || H <= nh) continue;
                // Check if the neighbor's width coordinate is out of bounds.
                // If it is, this neighbor is invalid, so we skip to the next direction.
                if (nw < 0 || W <= nw) continue;

                // If the valid neighbor cell contains a '#', increment the counter.
                if (table[nh][nw] === '#') count += 1;
            }

            // After checking all neighbors, if a '#' cell has no adjacent '#' cells,
            // then the condition is not met for this specific cell.
            // In this case, we set the overall answer to 'No'.
            if (count === 0) answer = 'No';
        }
    }

    // Output the final determined answer to the console.
    console.log(answer);
}

// Read input from standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// The read content is then passed as a string to the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8"));