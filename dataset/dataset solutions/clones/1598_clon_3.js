// This module contains a function designed to process raw input data,
// extract numerical segments, and then identify combinations of three distinct
// segments that can form a valid triangle according to geometric rules.
function identifyValidTriangles(rawDataString) {
    // Step 1: Parse the incoming raw string data.
    // The input is expected to be multi-line; we're primarily interested in the second line.
    const parsedLines = rawDataString.split('\n');

    // Step 2: Implement a guard clause for malformed or insufficient input.
    // If the expected second line containing segment lengths is missing or empty,
    // we cannot proceed with triangle calculation.
    if (parsedLines.length < 2 || !parsedLines[1] || parsedLines[1].trim() === '') {
        console.log(0); // Output zero as no triangles can be formed.
        return 0;      // Early exit, returning the count.
    }

    // Step 3: Extract and validate the segment measures.
    // The original code implicitly treated characters as numbers. Here, we explicitly
    // convert each character from the second line into a number and filter out
    // any non-numeric or invalid entries (e.g., negative lengths are not valid).
    const segmentMeasures = parsedLines[1].split('').map(charStr => {
        const numericValue = Number(charStr);
        // If conversion results in NaN, or if the number is negative,
        // we consider it an invalid measure and mark it for filtering.
        return (isNaN(numericValue) || numericValue < 0) ? -1 : numericValue;
    }).filter(val => val !== -1); // Remove all invalid entries.

    // Step 4: Obtain the total count of valid segments.
    // This is a helper variable to optimize loop bounds and improve readability.
    const totalSegments = segmentMeasures.length;

    // Step 5: Another guard clause: ensure there are at least three segments
    // available to even attempt forming a triangle.
    if (totalSegments < 3) {
        console.log(0); // Output zero if fewer than three segments exist.
        return 0;      // Early exit.
    }

    // Step 6: Initialize a counter for combinations that satisfy triangle conditions.
    let validTriangleCounter = 0;

    // Step 7: Iterate through all possible unique combinations of three distinct segments.
    // We use three nested loops with incrementing starting points to ensure uniqueness
    // and avoid duplicate combinations (e.g., (A,B,C) is same as (B,A,C)).
    for (let indexA = 0; indexA < totalSegments; indexA++) {
        const sideA = segmentMeasures[indexA]; // Store current side length in a helper variable.

        for (let indexB = indexA + 1; indexB < totalSegments; indexB++) {
            const sideB = segmentMeasures[indexB]; // Store current side length.

            for (let indexC = indexB + 1; indexC < totalSegments; indexC++) {
                const sideC = segmentMeasures[indexC]; // Store current side length.

                // Step 8: Validate distinctness of the chosen segments.
                // A triangle's sides must be distinct if the problem implies distinct *values*,
                // not just distinct *indices*. The original code had `!==` checks.
                // We check for equality first and skip if any are found.
                if (sideA === sideB || sideB === sideC || sideA === sideC) {
                    continue; // Move to the next combination if sides are not distinct.
                }

                // Step 9: Apply the Triangle Inequality Theorem.
                // For three segments to form a triangle, the sum of any two sides
                // must be strictly greater than the third side.
                // Breaking these conditions into separate variables enhances clarity.
                const conditionOne = (sideA + sideB > sideC);
                const conditionTwo = (sideA + sideC > sideB);
                const conditionThree = (sideB + sideC > sideA);

                // Step 10: If all conditions (distinctness and inequality) are met,
                // increment our valid triangle count.
                if (conditionOne && conditionTwo && conditionThree) {
                    validTriangleCounter++;
                }
            }
        }
    }

    // Step 11: Output the final count of valid triangles.
    console.log(validTriangleCounter);
    return validTriangleCounter; // Return value added for potential external use.
}

// Standard boilerplate for reading input in competitive programming environments.
// This part is generally environment-specific and kept similar for functional integrity.
const fileSystemModule = require("fs");
const standardInputFile = "/dev/stdin";
const textEncoding = "utf8";

// Execute the triangle identification logic using the input read from stdin.
identifyValidTriangles(fileSystemModule.readFileSync(standardInputFile, textEncoding));