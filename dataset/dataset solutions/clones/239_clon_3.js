// This script processes numerical input from standard input to determine
// if pairs of 2D rectangles intersect. Each rectangle is defined by two
// coordinate pairs, and the input consists of eight numbers per pair of rectangles.

// Import the Node.js file system module.
const fileSystemInterface = require('fs');

// Define the source for input data. In a typical competitive programming setup,
// this points to standard input.
const inputSourcePath = '/dev/stdin';

// Read all data from the specified input path.
// The data is decoded as UTF-8, then any leading or trailing whitespace
// is removed using .trim(). Finally, the string is split into an array
// of individual string segments using one or more whitespace characters
// as delimiters.
const rawDataSegments = fileSystemInterface.readFileSync(inputSourcePath, 'utf8').trim().split(/\s+/);

// An index to keep track of the current position while consuming data
// from the rawDataSegments array.
let currentDataPointer = 0;

/**
 * Retrieves and converts the next string segment from the input array
 * into a numeric value. It automatically advances the internal data pointer.
 * This function provides a more robust way to handle input parsing compared
 * to direct array access and unary plus conversion.
 * @returns {number} The parsed numeric value. Returns NaN if the segment
 *                   cannot be converted to a number or if no more segments exist.
 */
function extractNextNumericDatum() {
    // Check if there are still segments available to process.
    // This acts as a guard clause to prevent reading beyond array bounds.
    if (currentDataPointer >= rawDataSegments.length) {
        // Return NaN if data runs out, mimicking the behavior of `+undefined`.
        return NaN;
    }

    // Get the current segment and advance the pointer.
    const segmentValue = rawDataSegments[currentDataPointer];
    currentDataPointer++;

    // Convert the string segment to a floating-point number.
    // parseFloat is used to be explicit about handling potential decimal numbers,
    // though the original problem usually implies integers.
    return parseFloat(segmentValue);
}

/**
 * Represents a two-dimensional rectangle.
 * Coordinates are stored as provided, without implicit normalization (e.g., ensuring x1 <= x2).
 * This ensures the intersection logic precisely matches the original code's interpretation.
 */
class GeometricRectangle {
    /**
     * Constructs a new GeometricRectangle instance.
     * @param {number} xCoordinate1 - The first X coordinate.
     * @param {number} yCoordinate1 - The first Y coordinate.
     * @param {number} xCoordinate2 - The second X coordinate.
     * @param {number} yCoordinate2 - The second Y coordinate.
     */
    constructor(xCoordinate1, yCoordinate1, xCoordinate2, yCoordinate2) {
        this.x1 = xCoordinate1;
        this.y1 = yCoordinate1;
        this.x2 = xCoordinate2;
        this.y2 = yCoordinate2;
    }

    /**
     * Determines if this rectangle overlaps with another given rectangle.
     * The overlap condition is a direct translation of the original problem's logic,
     * which checks four specific coordinate relationships.
     * @param {GeometricRectangle} otherRectangle - The other rectangle to check against.
     * @returns {boolean} True if the rectangles overlap, false otherwise.
     */
    doesOverlapWith(otherRectangle) {
        // Condition 1: This rectangle's first X-coordinate is less than or equal to
        // the other rectangle's second X-coordinate. (Translated from 'a <= g')
        const xOverlapCheck1 = this.x1 <= otherRectangle.x2;

        // Condition 2: The other rectangle's first X-coordinate is less than or equal to
        // this rectangle's second X-coordinate. (Translated from 'e <= c')
        const xOverlapCheck2 = otherRectangle.x1 <= this.x2;

        // Condition 3: This rectangle's first Y-coordinate is less than or equal to
        // the other rectangle's second Y-coordinate. (Translated from 'b <= h')
        const yOverlapCheck1 = this.y1 <= otherRectangle.y2;

        // Condition 4: The other rectangle's first Y-coordinate is less than or equal to
        // this rectangle's second Y-coordinate. (Translated from 'f <= d')
        const yOverlapCheck2 = otherRectangle.y1 <= this.y2;

        // All four conditions must be met for the rectangles to be considered overlapping
        // according to the problem's definition. Using logical AND (&&) as it's equivalent
        // to bitwise AND (&) for boolean operands in this context and is more idiomatic.
        return xOverlapCheck1 && xOverlapCheck2 && yOverlapCheck1 && yOverlapCheck2;
    }
}

// Process the input data in chunks of 8 numbers.
// Each chunk defines two rectangles, each with four coordinates.
// The loop continues as long as there are at least 8 numbers remaining
// in the input array to fully define two rectangles.
while (currentDataPointer + 7 < rawDataSegments.length) {
    // Extract the four coordinates for the first rectangle.
    // Original variables: a, b, c, d
    const primaryRectX1 = extractNextNumericDatum();
    const primaryRectY1 = extractNextNumericDatum();
    const primaryRectX2 = extractNextNumericDatum();
    const primaryRectY2 = extractNextNumericDatum();

    // Extract the four coordinates for the second rectangle.
    // Original variables: e, f, g, h
    const secondaryRectX1 = extractNextNumericDatum();
    const secondaryRectY1 = extractNextNumericDatum();
    const secondaryRectX2 = extractNextNumericDatum();
    const secondaryRectY2 = extractNextNumericDatum();

    // Create instances of the GeometricRectangle class for better organization
    // and to encapsulate the rectangle properties and behavior.
    const firstRectangle = new GeometricRectangle(primaryRectX1, primaryRectY1, primaryRectX2, primaryRectY2);
    const secondRectangle = new GeometricRectangle(secondaryRectX1, secondaryRectY1, secondaryRectX2, secondaryRectY2);

    // Use the encapsulated method to check for overlap between the two rectangles.
    const isThereAnOverlap = firstRectangle.doesOverlapWith(secondRectangle);

    // Output the result string based on the overlap check.
    // The ternary operator is used for concise conditional output.
    console.log(isThereAnOverlap ? 'YES' : 'NO');
}