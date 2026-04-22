/*
 * This JavaScript program processes sets of eight numerical values from standard input.
 * Each set represents the coordinates of two distinct rectangles.
 * The primary function is to determine if these two rectangles spatially overlap.
 */
for (
    // Initialize the pointer for traversing the input data array.
    let dataPointIndex = 0,

    // Retrieve all content from standard input, treating it as UTF-8 encoded text.
    // Subsequently, split this text into an array of string tokens,
    // using any whitespace character as a delimiter.
    numericValueCollection = require('fs')
        .readFileSync('/dev/stdin', 'utf8')
        .split(/\s/);

    // In each iteration, eight numerical values are extracted from the
    // 'numericValueCollection' array and assigned to variables.
    // These assignments also serve as the loop's continuation condition;
    // the loop persists as long as valid, truthy numbers are assigned.

    // Coordinates for the first rectangle (Rectangle A):
    // (X-coordinate of lower-left corner, Y-coordinate of lower-left corner,
    //  X-coordinate of upper-right corner, Y-coordinate of upper-right corner)
    rectA_X1 = +numericValueCollection[dataPointIndex++],
    rectA_Y1 = +numericValueCollection[dataPointIndex++],
    rectA_X2 = +numericValueCollection[dataPointIndex++],
    rectA_Y2 = +numericValueCollection[dataPointIndex++],

    // Coordinates for the second rectangle (Rectangle B):
    // (X-coordinate of lower-left corner, Y-coordinate of lower-left corner,
    //  X-coordinate of upper-right corner, Y-coordinate of upper-right corner)
    rectB_X1 = +numericValueCollection[dataPointIndex++],
    rectB_Y1 = +numericValueCollection[dataPointIndex++],
    rectB_X2 = +numericValueCollection[dataPointIndex++],
    rectB_Y2 = +numericValueCollection[dataPointIndex++];

) {
    // The core logical expression evaluates whether the two rectangles intersect.
    // They overlap if and only if:
    // 1. Rectangle A's right edge is not to the left of Rectangle B's left edge (rectA_X1 <= rectB_X2).
    // 2. Rectangle B's right edge is not to the left of Rectangle A's left edge (rectB_X1 <= rectA_X2).
    // 3. Rectangle A's top edge is not below Rectangle B's bottom edge (rectA_Y1 <= rectB_Y2).
    // 4. Rectangle B's top edge is not below Rectangle A's bottom edge (rectB_Y1 <= rectA_Y2).
    // All four conditions must be true for an overlap to occur.

    // Based on the overlap detection, print 'YES' or 'NO' to the console.
    console.log(
        ( rectA_X1 <= rectB_X2 && rectB_X1 <= rectA_X2 && rectA_Y1 <= rectB_Y2 && rectB_Y1 <= rectA_Y2 )
            ? 'YES'
            : 'NO'
    );
}