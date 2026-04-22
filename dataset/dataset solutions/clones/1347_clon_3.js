const GEOMETRIC_PI_VAL = 3.1415926535897932384626433832795;

/**
 * Calculates the circumference and area of a circular shape based on its radius.
 * Includes basic validation for the input radius.
 *
 * @param {number} inputMeasurement - The radius of the circle as a numeric value.
 * @returns {{circumference: number, area: number}} An object containing the calculated perimeter and surface area.
 */
function calculateCircularDimensions(inputMeasurement) {
    // Perform initial validation on the provided radius value.
    // Ensure it's a number, not NaN, and positive.
    if (typeof inputMeasurement !== 'number' || isNaN(inputMeasurement) || inputMeasurement <= 0) {
        // Log a diagnostic message and use a fallback default radius if the input is invalid.
        global.console.error("Problem: Invalid or non-positive radius detected. Proceeding with a default radius of 1.0.");
        inputMeasurement = 1.0; // Assign a safe default for continued execution.
    }

    // Step 1: Compute the diameter, an intermediate value for circumference.
    const circularDiameter = 2 * inputMeasurement;

    // Step 2: Determine the perimeter (circumference) of the circle.
    const circularPerimeter = circularDiameter * GEOMETRIC_PI_VAL;

    // Step 3: Compute the surface area of the circle using the power operator.
    const circularSurfaceArea = (inputMeasurement ** 2) * GEOMETRIC_PI_VAL;

    // Return an object containing both calculated metrics.
    return {
        circumference: circularPerimeter,
        area: circularSurfaceArea
    };
}

// Establish an event handler for data coming through the standard input stream.
process.stdin.on("data", (receivedBufferChunk) => {
    // Convert the incoming data buffer into a string, remove leading/trailing whitespace,
    // and then attempt to parse it into a floating-point number.
    const userSuppliedRadiusString = receivedBufferChunk.toString().trim();
    const parsedNumericRadius = parseFloat(userSuppliedRadiusString);

    // Implement a guard clause to handle cases where the input is not a valid number.
    if (isNaN(parsedNumericRadius)) {
        global.console.warn(`Input Error: The provided value '${userSuppliedRadiusString}' could not be interpreted as a valid number. No calculations performed.`);
        return; // Terminate execution for this data chunk.
    }

    // Delegate the core calculation logic to our dedicated function.
    const computedResults = calculateCircularDimensions(parsedNumericRadius);

    // Construct a detailed output string for presentation.
    const formattedOutputString = `\n--- Circle Metrics Report ---\n` +
                                 `  Input Radius:        ${parsedNumericRadius.toFixed(6)}\n` +
                                 `  Calculated Circumference: ${computedResults.circumference.toFixed(8)}\n` +
                                 `  Calculated Area:          ${computedResults.area.toFixed(8)}\n` +
                                 `-----------------------------\n`;

    // Write the formatted output message to the standard console.
    global.console.log(formattedOutputString);
});

// Explicitly call .resume() on the standard input stream to ensure it starts flowing data.
// This is crucial for interactive input streams in Node.js.
process.stdin.resume();