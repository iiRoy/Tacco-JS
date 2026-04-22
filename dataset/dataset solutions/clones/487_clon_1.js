function bomb() {
    /*
     * This function simulates a "bomb" diffusion process on a 2D grid.
     * It uses a breadth-first search (BFS) like approach to explore paths.
     * The goal is to find the minimum number of steps to reach a specific
     * target condition, or "NA" if unreachable.
     */

    // Object to keep track of visited coordinates (x,y) to prevent cycles and redundant processing.
    var obj = {};

    // Variable to store the final answer. Initialized to "NA" (Not Applicable/Found).
    var ans = "NA";

    // The 'leaf' array acts as a queue for the BFS.
    // Each element is [x, y, count], representing:
    // x: current row index
    // y: current column index
    // count: steps taken to reach this point
    var leaf = [
        [0, 0, 0],
        [1, 0, 0]
    ];


    while (true) {
        // Main loop continues as long as there are points to explore.

        // If the 'leaf' queue is empty, all reachable points have been processed.
        if (leaf.length === 0) {
            break; // Exit the loop as no more paths can be explored.
        }


        // Dequeue the next point to process.
        var ary = leaf.shift();


        // Extract coordinates and step count from the dequeued array.
        var x = ary[0];
        var y = ary[1];


        // Check if this coordinate (x,y) has already been visited.
        // This prevents infinite loops and re-processing.
        if (obj.hasOwnProperty(x + "," + y)) {
            continue; // If visited, skip to the next iteration.
        } else {
            // Mark the current coordinate as visited.
            obj[x + "," + y] = true;
        }


        // Extract the step count.
        var cnt = ary[2];


        // Check for the target condition:
        // Is the current column 'y' the last column (n-1)?
        // And is the grid value at (x,y) not '2'?
        if (y === n - 1 && xy[x][y] !== 2) {
            ans = cnt; // If target reached, store the current step count as the answer.
            break;     // Exit the main loop as a valid path has been found.
        }


        // Get the value at the current grid position.
        var v = xy[x][y];


        // Special handling based on the grid value 'v'.
        if (v === 1) {
            // If 'v' is 1, it means we can potentially move right multiple steps.
            var flag = false; // Flag to indicate if the rightmost boundary (n-1) was reached.

            while (true) {
                y++; // Move one step to the right.

                // Check if the end of the grid (n-1 column) is reached.
                if (y === n - 1) {
                    flag = true; // Mark flag as true.
                    break;       // Exit inner loop.
                }

                // If the next cell is not '1', we can't continue moving right.
                if (xy[x][y] !== 1) {
                    y--;   // Revert back one step (as the current 'y' is not 1).
                    break; // Exit inner loop.
                }
            }

            // If the flag is true, it means we reached the end of the grid by moving right.
            if (flag) {
                ans = cnt; // Update answer with current step count.
                break;     // Exit main loop.
            }
        } else if (v === 2) {
            // If 'v' is 2, it means we must move left until the value is no longer '2'.
            while (true) {
                y--; // Move one step to the left.

                // If the value at the new position is no longer '2', stop.
                if (xy[x][y] !== 2) {
                    break; // Exit inner loop.
                }
            }
        }


        // Explore next possible states:
        // From the current position (x, y), add three new potential states to the queue.
        // These states involve switching rows (1-x) and moving to y, y+1, or y+2 in the new row.
        // Each move increments the step count (cnt+1).
        for (var i = 0; i <= 2; i++) {
            leaf.push([1 - x, y + i, cnt + 1]);
        }
    }

    // Return the final answer.
    return ans;
}


/*
 * Main execution block:
 * Reads input, processes it, and calls the 'bomb' function for each test case.
 */

// Read the entire input from stdin.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from input and split it into an array of lines.
var arr = input.trim().split("\n");


// Loop through test cases until a '0' is encountered.
while (true) {
    // Shift the first line from the array, convert it to a number, and store in 'n'.
    var n = arr.shift() - 0;

    // If 'n' is 0, it signifies the end of input.
    if (n === 0) {
        break; // Exit the loop.
    }

    // Initialize a 2D array 'xy' to store grid data for the current test case.
    var xy = [];

    // Read the first row of grid data, split by spaces, and convert to numbers.
    xy[0] = arr.shift().split(" ").map(Number);

    // Read the second row of grid data, split by spaces, and convert to numbers.
    xy[1] = arr.shift().split(" ").map(Number);


    // Call the 'bomb' function to solve the current test case
    // and print its result to the console.
    console.log(bomb());
}