/*
 * This JavaScript code processes robot movement commands.
 * It reads commands from standard input, simulates robot movement
 * on a grid, and outputs its final coordinates.
 *
 * Type I Clone: Extensive modifications to whitespace and comments
 * while preserving the exact original structure and identifiers.
 */

var input = require('fs').readFileSync(
    '/dev/stdin', // Path to read input from
    'utf8'        // Encoding for reading the file
);


var arr = input
    .trim() // Remove leading/trailing whitespace
    .split("\n"); // Split input into an array of lines


// Main loop to process multiple scenarios
while (true) {
    // Read the width and height for the current scenario
    var wh = arr.shift();

    // Check for the termination condition "0 0"
    if (wh == "0 0") {
        break; // Exit the main loop if "0 0" is encountered
    }

    // Parse width and height from the string
    wh = wh
        .split(" ") // Split by space
        .map(Number); // Convert parts to numbers


    var w = wh[0]; // Grid width
    var h = wh[1]; // Grid height

    /*
     * Initialize robot's state:
     * xy[0]: direction (0: North, 1: East, 2: South, 3: West)
     * xy[1]: x-coordinate
     * xy[2]: y-coordinate
     * Initial position is (1,1) facing North (0)
     */
    var xy = [0, 1, 1];


    // Loop to process commands for the current scenario
    while (true) {
        // Read the next command line
        var ary = arr.shift().split(" ");

        // Special handling for 'FORWARD'/'BACKWARD' with length 2
        // The original code implies the second argument is a number,
        // and if it's only two elements, it needs conversion.
        // This is a subtle point from the original.
        if (ary.length == 2) {
            ary[1] = ary[1] - 0; // Convert string to number using subtraction
        }


        // Check if the command is "STOP"
        if (ary[0] == "STOP") {
            break; // Exit the command processing loop
        }

        // Handle "RIGHT" command
        if (ary[0] == "RIGHT") {
            xy[0]++; // Turn right (increment direction)
            if (xy[0] == 4) {
                xy[0] = 0; // Wrap around from West to North
            }
        }

        // Handle "LEFT" command
        if (ary[0] == "LEFT") {
            xy[0]--; // Turn left (decrement direction)
            if (xy[0] == -1) {
                xy[0] = 3; // Wrap around from North to West
            }
        }

        // Handle "FORWARD" command
        if (ary[0] == "FORWARD") {
            while (ary[1]--) { // Loop for the specified number of steps
                if (xy[0] == 0) {
                    xy[2]++; // North: increase y
                }
                if (xy[0] == 1) {
                    xy[1]++; // East: increase x
                }
                if (xy[0] == 2) {
                    xy[2]--; // South: decrease y
                }
                if (xy[0] == 3) {
                    xy[1]--; // West: decrease x
                }
            }
        }

        // Handle "BACKWARD" command
        if (ary[0] == "BACKWARD") {
            while (ary[1]--) { // Loop for the specified number of steps
                if (xy[0] == 0) {
                    xy[2]--; // North: decrease y
                }
                if (xy[0] == 1) {
                    xy[1]--; // East: decrease x
                }
                if (xy[0] == 2) {
                    xy[2]++; // South: increase y
                }
                if (xy[0] == 3) {
                    xy[1]++; // West: increase x
                }
            }
        }

        // Ensure robot stays within grid boundaries (x-coordinates)
        if (xy[1] < 1) {
            xy[1] = 1; // Cannot go left of column 1
        }
        if (xy[2] < 1) {
            xy[2] = 1; // Cannot go below row 1
        }
        if (xy[1] > w) {
            xy[1] = w; // Cannot go right of column 'w'
        }
        if (xy[2] > h) {
            xy[2] = h; // Cannot go above row 'h'
        }
    }

    // Remove the direction component, as only x and y are needed for output
    xy.shift();

    // Output the final x and y coordinates, joined by a space
    console.log(xy.join(" "));
}