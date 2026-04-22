/*
 * This file contains a JavaScript program that solves a pathfinding
 * problem using Breadth-First Search (BFS) on a grid.
 * It calculates the shortest path from a starting point to an
 * ending point and then computes a final answer based on the
 * path length and the number of traversable cells.
 */

/* Enforce strict parsing and execution rules for cleaner code */
'use strict'
// This directive ensures that code runs in "strict mode".

/**
 * The main function processes the input string, sets up the grid,
 * performs BFS, calculates the number of blank cells, and prints the result.
 * @param {string} s - The raw input string containing grid dimensions and the grid itself.
 */
function main(s) {

    // Split the input string into an array of lines.
    s = s.split('\n'); // The input is typically newline-separated.

    /* Extract grid dimensions (Rows and Columns) from the first line of input. */
    const R = Number(s[0].split(' ')[0]); // R represents the number of rows.
    const C = Number(s[0].split(' ')[1]); // C represents the number of columns.

    // Define the starting row (sr) and starting column (sc) coordinates.
    const sr = 0; /* Starting row index is 0 (top-left corner). */
    const sc = 0; // Starting column index is 0.

    // Define the goal row (gr) and goal column (gc) coordinates.
    const gr = R - 1; // Goal row is the last row.
    const gc = C - 1; // Goal column is the last column.

    /*
     * Construct the grid (table) from the input lines.
     * It slices the input array to exclude the first line (dimensions) and
     * the last line (potentially an empty line or EOF marker).
     * Each remaining line is split into an array of characters.
     */
    const table = s.slice(1, -1).map(l => l.split(''));

    /*
     * Initialize a 2D array 'min' to store the minimum steps to reach each cell.
     * It's filled with '*' initially, indicating unvisited or unreachable cells.
     * Once a cell is visited, its value will be updated to the number of steps.
     */
    const min = [...Array(R)].map(l => [...Array(C)].fill('*'));

    // Define arrays for row and column direction changes for 4-directional movement.
    const dr = [0, 1, 0, -1]; // Delta for rows: Right, Down, Left, Up.
    const dc = [1, 0, -1, 0]; // Delta for columns: Right, Down, Left, Up.

    /**
     * Implements a Breadth-First Search (BFS) algorithm to find the shortest path
     * from the start (sr, sc) to the goal (gr, gc) in the grid.
     * It updates the 'min' array with the shortest distance to each reachable cell.
     * @returns {number|string} The shortest distance to the goal, or '*' if unreachable.
     */
    const bfs = () => {
        // Initialize a queue for BFS.
        const que = []; // The queue will store [row, column] pairs.

        // Push the starting coordinates into the queue.
        que.push([sr, sc]);
        // Mark the starting cell with a distance of 1.
        min[sr][sc] = 1;

        // Continue BFS as long as there are elements in the queue.
        while (que.length > 0) {

            // Dequeue the current cell's coordinates.
            const p = que.shift(); // 'p' stands for "current point".

            // If the current cell is the goal, we've found the shortest path, so break.
            if (p[0] === gr && p[1] === gc)
                break;

            // Explore all four possible directions (neighbors).
            for (let i = 0; i < 4; i++) {
                // Calculate the coordinates of the neighbor.
                const nr = p[0] + dr[i]; // Neighbor row.
                const nc = p[1] + dc[i]; // Neighbor column.

                // Check if the neighbor is within the grid boundaries.
                if (nr < 0 || R <= nr) continue; // Out of bounds vertically.
                if (nc < 0 || C <= nc) continue; // Out of bounds horizontally.

                // Check if the neighbor cell is a wall ('#').
                if (table[nr][nc] === '#') continue; // Cannot move through walls.

                // Check if the neighbor has already been visited.
                if (min[nr][nc] !== '*') continue; // '*' means not yet visited.

                // If all checks pass, enqueue the neighbor.
                que.push([nr, nc]);
                // Update the distance to the neighbor.
                min[nr][nc] = min[p[0]][p[1]] + 1; // Distance is current cell's distance + 1.
            }
        }

        // Return the shortest distance to the goal cell.
        return min[gr][gc];
    }

    /**
     * Counts the total number of traversable cells ('.') in the grid.
     * @returns {number} The count of blank ('.') cells.
     */
    const countBlank = () => {
        // Iterate through each row, filter for '.' cells, count them, and sum up.
        return table.map(l => l.filter(c => c === '.').length).reduce((a, b) => a + b);
    }

    // Initialize the answer variable.
    let ans = 0;

    // Execute BFS to find the shortest path.
    const shortest = bfs(); // Store the result of BFS.

    /*
     * Determine the final answer based on whether a path was found.
     * If 'shortest' is '*', it means the goal was unreachable.
     */
    if (shortest === '*') {
        ans = -1; // If no path, set answer to -1.
    } else {
        // If a path was found, calculate the answer:
        // (Total blank cells) - (Shortest path length).
        ans = countBlank() - shortest;
    }

    // Output the final calculated answer to the console.
    console.log(ans);
}

// Execute the main function by reading input from standard input.
// This is a common way to handle input in competitive programming environments.
main(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input synchronously.
/*
 * The 'require("fs")' statement imports the Node.js file system module.
 * '.readFileSync("/dev/stdin", "utf8")' reads the entire content of
 * standard input as a UTF-8 encoded string.
 */