/*
 * This script processes a series of coordinate paths
 * to identify "clone" paths based on their shape and orientation.
 * It reads input from standard input, expecting a specific format.
 */

// Import the 'fs' module to handle file system operations,
// specifically for reading from standard input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace,
// then split the string into an array of lines.
var arr = input.trim().split("\n");

// The main processing loop continues indefinitely until a specific
// termination condition (N == 0) is met.
while (true) {

    // Extract the first element from 'arr', which represents the
    // number of coordinate sets for the current processing block.
    // The '-0' forcibly converts the string to a number.
    var N = arr.shift() - 0;

    // Check for the termination condition: if N is 0, exit the loop.
    if (N == 0) {
        break; // Exit the 'while(true)' loop
    }

    // Initialize 'f' as an empty string. This variable will store
    // the normalized representation of the first path encountered
    // in each block, serving as a reference.
    var f = "";

    /*
     * This loop iterates N+1 times.
     * The first iteration (when I is 0) establishes the reference path 'f'.
     * Subsequent iterations compare other paths against 'f'.
     */
    for (var I = 0; I < N + 1; I++) {

        // Read the number of individual coordinate pairs for the current path.
        var n = arr.shift() - 0;

        // Initialize 'ary' to store the parsed coordinate pairs.
        var ary = [];

        // Populate 'ary' with 'n' coordinate pairs.
        // Each line is split by space, and components are converted to numbers.
        while (n--) {
            ary.push(arr.shift().split(" ").map(Number));
        }

        // Initialize 'r' to store the relative movements between consecutive points.
        // Each movement is represented as an array: [direction, magnitude].
        var r = [];

        /*
         * Iterate through the 'ary' to calculate movements between points.
         * The loop starts from the second point (index 1) to compare it
         * with its preceding point.
         */
        for (var i = 1; i < ary.length; i++) {
            var a = ary[i - 1]; // The previous point's coordinates
            var b = ary[i];     // The current point's coordinates

            // Determine movement direction and magnitude based on coordinate changes.
            // Directions are abbreviated: 's' (south), 'n' (north), 'w' (west), 'e' (east).
            if (a[0] == b[0] && a[1] > b[1]) {
                r.push(["s", a[1] - b[1]]); // Vertical movement: South
            } else if (a[0] == b[0] && a[1] < b[1]) {
                r.push(["n", b[1] - a[1]]); // Vertical movement: North
            } else if (a[1] == b[1] && a[0] > b[0]) {
                r.push(["w", a[0] - b[0]]); // Horizontal movement: West
            } else if (a[1] == b[1] && a[0] < b[0]) {
                r.push(["e", b[0] - a[0]]); // Horizontal movement: East
            }
        }

        // Concatenate the movements in 'r' into a single string 'rA'.
        var rA = r.join("");

        // Create a reversed version of the movements string 'rB'.
        // Note: r.reverse() modifies 'r' in place, so 'rA' must be derived first.
        var rB = r.reverse().join("");

        // For the very first path (I=0) in a block, set it as the reference 'f'.
        if (I == 0) {
            // Convert 'r' to a string and normalize directions to uppercase
            // (N, E, S, W) for the reference path.
            f = r.join("").replace(/n/g, "N").replace(/e/g, "E").replace(/s/g, "S").replace(/w/g, "W");
        }
        else {
            // For subsequent paths, generate all 8 possible rotations/reflections
            // of the current path and compare them against the reference 'f'.

            // Normalize 'rA' (original path) for 4 orientations (North-up, East-up, South-up, West-up).
            var NrA = rA.replace(/n/g, "N").replace(/e/g, "E").replace(/s/g, "S").replace(/w/g, "W"); // N-up
            var ErA = rA.replace(/n/g, "E").replace(/e/g, "S").replace(/s/g, "W").replace(/w/g, "N"); // E-up
            var SrA = rA.replace(/n/g, "S").replace(/e/g, "W").replace(/s/g, "N").replace(/w/g, "E"); // S-up
            var WrA = rA.replace(/n/g, "W").replace(/e/g, "N").replace(/s/g, "E").replace(/w/g, "S"); // W-up

            // Normalize 'rB' (reversed path) for 4 orientations.
            var NrB = rB.replace(/n/g, "N").replace(/e/g, "E").replace(/s/g, "S").replace(/w/g, "W"); // N-up (reversed)
            var ErB = rB.replace(/n/g, "E").replace(/e/g, "S").replace(/s/g, "W").replace(/w/g, "N"); // E-up (reversed)
            var SrB = rB.replace(/n/g, "S").replace(/e/g, "W").replace(/s/g, "N").replace(/w/g, "E"); // S-up (reversed)
            var WrB = rB.replace(/n/g, "W").replace(/e/g, "N").replace(/s/g, "E").replace(/w/g, "S"); // W-up (reversed)

            // If any of the 8 variations of the current path match the reference path 'f',
            // then it's considered a clone. Print its index 'I'.
            if (f == ErA || f == SrA || f == WrA || f == NrA ||
                f == ErB || f == SrB || f == WrB || f == NrB) {
                console.log(I);
            }
        }
    }

    // After processing all paths for the current 'N' block, print a separator.
    console.log("+++++");
}

// End of script execution.