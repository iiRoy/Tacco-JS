// This script reads coordinate data from standard input and processes it.
// It's designed to determine if two rectangles, defined by their coordinates, overlap.
// The input is expected to be a sequence of numbers, where every 8 numbers define a pair of rectangles.

for (
    j = 0, // Initialize the index 'j' for iterating through the input array.
    i = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/); // Read input from stdin, decode as UTF-8, and split by any whitespace.

    // This section acts as both the loop condition and the variable assignment for each iteration.
    // It reads 8 numbers from the 'i' array, converting them to numbers using the unary plus operator.
    // These numbers represent the coordinates (x1, y1, x2, y2) for two rectangles.
    a = +i[j++], // x1 coordinate of the first rectangle
    b = +i[j++], // y1 coordinate of the first rectangle
    c = +i[j++], // x2 coordinate of the first rectangle
    d = +i[j++], // y2 coordinate of the first rectangle
    e = +i[j++], // x1 coordinate of the second rectangle
    f = +i[j++], // y1 coordinate of the second rectangle
    g = +i[j++], // x2 coordinate of the second rectangle
    h = +i[j++]; // y2 coordinate of the second rectangle (loop continues as long as 'h' is a valid number)
) {
    // The loop body executes for each set of 8 coordinates read.
    // It checks for an overlap condition between the two rectangles.
    // Rectangle 1: (a, b) to (c, d)
    // Rectangle 2: (e, f) to (g, h)

    // Overlap condition logic:
    // a <= g  : The first rectangle's left edge is not to the right of the second rectangle's right edge.
    // e <= c  : The second rectangle's left edge is not to the right of the first rectangle's right edge.
    // b <= h  : The first rectangle's bottom edge is not above the second rectangle's top edge.
    // f <= d  : The second rectangle's bottom edge is not above the first rectangle's top edge.
    // All four conditions must be true for an overlap to exist.
    console.log(
        a <= g
        & e <= c
        & b <= h
        & f <= d
        ? 'YES' // Output 'YES' if the rectangles overlap.
        : 'NO'  // Output 'NO' if they do not overlap.
    );
}