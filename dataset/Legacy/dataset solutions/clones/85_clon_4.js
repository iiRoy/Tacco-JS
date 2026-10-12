const fileSystem = require("fs");

// Helper function to compute and format the slope of a line segment.
// This function meticulously replicates the original's floating-point arithmetic
// and string formatting behavior, including how it handles division by zero (Infinity)
// and undefined/NaN inputs (NaN).
const deriveSlopeRepresentation = (pointAx, pointAy, pointBx, pointBy) => {
    // When inputs are undefined (due to insufficient data in a line),
    // Number(undefined) results in NaN.
    // Arithmetic operations involving NaN propagate NaN.
    // (NaN - NaN) / (NaN - NaN) results in NaN.
    // NaN.toFixed(6) yields the string "NaN".
    // Division by zero (e.g., 5 / 0) results in Infinity or -Infinity.
    // Infinity.toFixed(6) yields the string "Infinity".
    // These specific string representations are crucial for exact behavioral equivalence.
    return ((pointBy - pointAy) / (pointBx - pointAx)).toFixed(6);
};

// A generator function to process each line of input.
// It yields the comparison result ('YES' or 'NO') for each valid line.
function* processInputLines(inputDataContent) {
    const allInputLines = inputDataContent.split('\n');

    // Iterate over each line using a for...of loop, a different control flow from the original's .map().
    for (const currentLineSegment of allInputLines) {
        const coordinateStrings = currentLineSegment.split(' ');

        // The original code includes a check `if(c[2])`. This condition
        // ensures that the line has at least three space-separated parts,
        // and that the third part (c[2]) is not an empty string.
        // This exact condition is preserved to maintain identical filtering behavior.
        if (coordinateStrings[2]) {
            // Convert all string parts to numbers. If a part is missing (e.g., coordinateStrings[7] for a short line),
            // Number(undefined) will correctly result in NaN, preserving original behavior.
            const numericCoordinates = coordinateStrings.map(Number);

            // Extract the eight coordinate values. If a coordinate is missing in the input line,
            // the corresponding variable will receive NaN from numericCoordinates,
            // which is then correctly handled by deriveSlopeRepresentation.
            const firstPointX1 = numericCoordinates[0];
            const firstPointY1 = numericCoordinates[1];
            const firstPointX2 = numericCoordinates[2];
            const firstPointY2 = numericCoordinates[3];
            const secondPointX1 = numericCoordinates[4];
            const secondPointY1 = numericCoordinates[5];
            const secondPointX2 = numericCoordinates[6];
            const secondPointY2 = numericCoordinates[7];

            // Calculate the formatted slopes for both line segments.
            const slopeOfFirstSegment = deriveSlopeRepresentation(firstPointX1, firstPointY1, firstPointX2, firstPointY2);
            const slopeOfSecondSegment = deriveSlopeRepresentation(secondPointX1, secondPointY1, secondPointX2, secondPointY2);

            // Compare the formatted slope strings and yield the result.
            yield slopeOfFirstSegment === slopeOfSecondSegment ? 'YES' : 'NO';
        }
    }
}

// Read the entire standard input synchronously.
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

// Iterate over the results yielded by the generator and print each one to the console.
for (const comparisonResult of processInputLines(rawInputContent)) {
    console.log(comparisonResult);
}
