// Activate the standard input stream to begin receiving data.
process.stdin.resume();

// Set the character encoding for the incoming data stream to UTF-8.
process.stdin.setEncoding('utf8');

// Declare a constant for the mathematical value of Pi, enhancing readability and maintainability.
const MATHEMATICAL_PI = Math.PI;

// Register an event listener to handle incoming data chunks from the standard input.
process.stdin.on('data', function(incomingDataChunk) {
    // Convert the data chunk to a string, remove leading/trailing whitespace,
    // then split it into an array of strings using one or more whitespace characters as delimiters.
    // Finally, parse each resulting string into a floating-point number.
    const numericalInputTokens = String(incomingDataChunk).trim().split(/\s+/).map(parseFloat);

    // Perform a basic validation check: ensure there's at least one number provided.
    if (numericalInputTokens.length === 0 || numericalInputTokens[0] === undefined) {
        console.error("Input processing error: No valid numeric data found. Please provide a number.");
        return; // Terminate execution for this data chunk if input is invalid.
    }

    // Extract the primary numeric value, which is expected to represent the circle's radius.
    let currentCircleRadius = numericalInputTokens[0];

    // Conduct comprehensive validation for the radius value:
    // It must be a number, not NaN, finite, and strictly positive.
    if (isNaN(currentCircleRadius) || !isFinite(currentCircleRadius) || currentCircleRadius <= 0) {
        console.error(`Input processing error: The provided radius '${currentCircleRadius}' is invalid. Please ensure it's a positive, finite number.`);
        return; // Terminate execution if the radius is unsuitable.
    }

    // Calculate the square of the radius as an intermediate step.
    const radiusSquaredValue = Math.pow(currentCircleRadius, 2);

    // Compute the circle's total area using the formula: PI * radius^2.
    const calculatedCircleArea = MATHEMATICAL_PI * radiusSquaredValue;

    // Compute the circle's total circumference using the formula: 2 * PI * radius.
    const calculatedCircleCircumference = 2 * MATHEMATICAL_PI * currentCircleRadius;

    // Output the calculated circumference and area, separated by a space,
    // mirroring the original output format but with updated variable names.
    console.log(calculatedCircleCircumference + ' ' + calculatedCircleArea);
});

// Add an error handler for the standard input stream to catch and report potential issues.
process.stdin.on('error', (streamError) => {
    console.error(`An unexpected error occurred during input stream operation: ${streamError.message}`);
});