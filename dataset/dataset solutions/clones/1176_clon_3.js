// This module is responsible for managing the input stream from the console.
const dataInputSource = process.stdin;

// Activate the input stream to begin listening for user input.
dataInputSource.resume();

// Set the character encoding for the incoming data to UTF-8.
dataInputSource.setEncoding('utf-8');

// Define a constant for converting angular measurements from degrees to radians,
// which is required by JavaScript's Math.sin and Math.cos functions.
const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0;

/**
 * Computes various geometrical properties of a triangle given two sides and their included angle.
 * This function encapsulates the core mathematical logic for clarity and reusability.
 *
 * @param {number} primarySideLength - The length of the first side of the triangle. Must be positive.
 * @param {number} secondarySideLength - The length of the second side of the triangle. Must be positive.
 * @param {number} angleInDegrees - The angle (in degrees) between the primary and secondary sides. Must be > 0 and < 180.
 * @returns {{area: number, perimeter: number, height: number}} An object containing the calculated area, perimeter, and height.
 * @throws {Error} If the calculated third side squared is negative, indicating invalid triangle dimensions.
 */
function determineTriangleAttributes(primarySideLength, secondarySideLength, angleInDegrees) {
    // Convert the angle from degrees to radians for trigonometric calculations.
    const effectiveAngleRadians = angleInDegrees * DEGREES_TO_RADIANS_FACTOR;

    // Pre-calculate sine and cosine of the angle to optimize repeated usage.
    const angleCosineValue = Math.cos(effectiveAngleRadians);
    const angleSineValue = Math.sin(effectiveAngleRadians);

    // Calculate the square of the third side using the Law of Cosines: c^2 = a^2 + b^2 - 2ab*cos(C).
    const thirdSideSquaredValue = (primarySideLength * primarySideLength) +
                                  (secondarySideLength * secondarySideLength) -
                                  (2 * primarySideLength * secondarySideLength * angleCosineValue);

    // A guard clause to catch impossible triangle configurations (e.g., sides too short).
    if (thirdSideSquaredValue < 0) {
        throw new Error("Geometric anomaly detected: Resulting third side squared is negative. Invalid triangle input.");
    }
    const thirdSideCalculated = Math.sqrt(thirdSideSquaredValue);

    // Calculate the height (altitude) of the triangle relative to the primary side.
    // This uses the formula: h = b * sin(C).
    const triangleAltitude = secondarySideLength * angleSineValue;

    // Calculate the area of the triangle using the formula: Area = (1/2) * base * height.
    const surfaceAreaResult = (primarySideLength * triangleAltitude) / 2.0;

    // Calculate the total perimeter by summing all three side lengths.
    const totalBoundaryLength = primarySideLength + secondarySideLength + thirdSideCalculated;

    // Return all computed values as a structured object.
    return {
        area: surfaceAreaResult,
        perimeter: totalBoundaryLength,
        height: triangleAltitude
    };
}

// Register an event handler to process data chunks received from the input stream.
dataInputSource.on('data', (incomingDataBuffer) => {
    // Clean up the incoming string (remove whitespace) and split it into an array of string numbers.
    const stringNumbersArray = incomingDataBuffer.trim().split(' ');

    // Convert each string number in the array to its numeric representation.
    const numericalParameters = stringNumbersArray.map(Number);

    // Define the expected number of input arguments for a triangle (side1, side2, angle).
    const REQUIRED_PARAMETER_COUNT = 3;

    // Validate if the correct number of parameters were provided.
    if (numericalParameters.length !== REQUIRED_PARAMETER_COUNT) {
        console.error(`Input Error: Expected ${REQUIRED_PARAMETER_COUNT} numerical values (side1, side2, angle), but received ${numericalParameters.length}.`);
        process.exit(1); // Exit with an error code.
    }

    // Destructure the array into named variables for better readability.
    const [firstEdge, secondEdge, includedAngleValue] = numericalParameters;

    // Perform validation for each individual parameter.
    // Sides must be positive numbers.
    if (isNaN(firstEdge) || firstEdge <= 0) {
        console.error("Validation Error: The first side length must be a positive number.");
        process.exit(1);
    }
    if (isNaN(secondEdge) || secondEdge <= 0) {
        console.error("Validation Error: The second side length must be a positive number.");
        process.exit(1);
    }
    // Angle must be a positive number and less than 180 degrees (for a non-degenerate triangle).
    if (isNaN(includedAngleValue) || includedAngleValue <= 0 || includedAngleValue >= 180) {
        console.error("Validation Error: The included angle must be a positive value less than 180 degrees.");
        process.exit(1);
    }

    try {
        // Invoke the triangle calculation function with the validated inputs.
        const triangleResults = determineTriangleAttributes(firstEdge, secondEdge, includedAngleValue);

        // Output the computed area, perimeter, and height, each on a new line.
        // The output order (Area, Perimeter, Height) is maintained as per original.
        console.log(`${triangleResults.area}\n${triangleResults.perimeter}\n${triangleResults.height}`);
    } catch (computationFailure) {
        // Catch and report any errors that occur during the calculation process.
        console.error(`Runtime Error during calculation: ${computationFailure.message}`);
        process.exit(1);
    }
});

// Optional: Listener for the 'end' event, triggered when the input stream closes.
// dataInputSource.on('end', () => {
//     console.log('Finished processing all input data.');
// });

// Optional: Listener for 'error' events, to handle issues with the input stream itself.
dataInputSource.on('error', (streamErr) => {
    console.error(`Critical Stream Error: An unrecoverable error occurred with the input stream: ${streamErr.message}`);
    process.exit(1);
});