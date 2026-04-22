const convertRadiansToDegrees = (radiansValue) => {
    // Validate that the input is a numeric value
    if (typeof radiansValue !== 'number' || isNaN(radiansValue)) {
        // In case of invalid input, log an error and return a default value
        console.error("Invalid numeric input provided for radian to degree conversion.");
        return 0.0; // Return zero as a safe default for erroneous input
    }
    // Perform the conversion from radians to degrees using the standard formula
    return radiansValue * (180.0 / Math.PI);
};

// This function processes an input string, extracts parameters,
// performs conditional angle calculations, and outputs the result in degrees.
function processInputAndComputeAngle(inputDataString) {
    // Ensure the input string is not empty or null, and is of type string
    if (!inputDataString || typeof inputDataString !== 'string' || inputDataString.trim() === '') {
        console.error("Error: Input data string is empty, null, or not a string type.");
        return; // Terminate execution if input is invalid
    }

    // Split the input string into an array of segments using one or more whitespace characters
    const dataSegments = inputDataString.trim().split(/\s+/);

    // Verify that the required number of parameters (three) are present
    if (dataSegments.length < 3) {
        console.error(`Error: Insufficient parameters provided. Expected 3, but received ${dataSegments.length}.`);
        return;
    }

    // Parse the string segments into floating-point numbers for calculation
    const primaryParameter = parseFloat(dataSegments[0]);
    const secondaryParameter = parseFloat(dataSegments[1]);
    const tertiaryParameter = parseFloat(dataSegments[2]);

    // Check if any of the parsed parameters resulted in NaN (Not-a-Number)
    if (isNaN(primaryParameter) || isNaN(secondaryParameter) || isNaN(tertiaryParameter)) {
        console.error("Error: One or more input parameters could not be successfully parsed into valid numbers.");
        return;
    }

    // Calculate intermediate values to simplify later expressions and improve readability
    const primaryParameterSquared = primaryParameter * primaryParameter; // Represents 'a*a'
    const secondaryParameterSquared = secondaryParameter * secondaryParameter; // Represents 'b*b'

    // Initialize the variable that will hold the calculated angle in radians
    let finalAngleInRadians = 0.0;

    // Calculate the threshold value used in the conditional logic
    // This corresponds to 'b * (a*a) / 2' from the original formula
    const decisionThreshold = (secondaryParameter * primaryParameterSquared) / 2.0;

    // --- Conditional Angle Calculation Logic ---
    // The path taken depends on the relationship between 'tertiaryParameter' and 'decisionThreshold'
    if (tertiaryParameter >= decisionThreshold) {
        // Path 1: Corresponds to 'Math.atan(2/a * (b - x/(a*a)))'
        // Break down the complex expression into smaller, manageable parts for clarity

        // Guard against division by zero for primaryParameterSquared
        if (primaryParameterSquared === 0) {
            console.error("Error: Division by zero detected in first calculation path (primary parameter squared is zero).");
            return;
        }
        const innerRatio = tertiaryParameter / primaryParameterSquared; // x / (a*a)

        const differenceTerm = secondaryParameter - innerRatio; // b - (x/(a*a))

        // Guard against division by zero for primaryParameter
        if (primaryParameter === 0) {
            console.error("Error: Division by zero detected in first calculation path (primary parameter is zero).");
            return;
        }
        const outerFactor = 2.0 / primaryParameter; // 2/a

        finalAngleInRadians = Math.atan(outerFactor * differenceTerm);
    } else {
        // Path 2: Corresponds to 'Math.atan(a * (b*b) / (2*x))'
        // Break down the complex expression into smaller, manageable parts

        const numeratorExpression = primaryParameter * secondaryParameterSquared; // a * (b*b)
        const denominatorExpression = 2.0 * tertiaryParameter; // 2*x

        // Guard against division by zero for denominatorExpression
        if (denominatorExpression === 0) {
            // If denominator is zero, Math.atan will handle Infinity/ -Infinity,
            // resulting in PI/2 or -PI/2. We'll log a warning but allow it to proceed.
            console.warn("Warning: Division by zero encountered in second calculation path (2 * tertiary parameter is zero). Result will be +/- 90 degrees.");
        }

        finalAngleInRadians = Math.atan(numeratorExpression / denominatorExpression);
    }

    // Convert the computed angle from radians to degrees using the dedicated helper function
    const finalResultInDegrees = convertRadiansToDegrees(finalAngleInRadians);

    // Output the final result to the console, formatted to a specific number of decimal places
    console.log(`The calculated angle in degrees is: ${finalResultInDegrees.toFixed(6)}`);
}

// --- Program Execution Entry Point ---
// This block handles reading input from the standard input stream
// and initiating the main calculation process.
try {
    // Read all data from /dev/stdin as a UTF-8 encoded string
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Call the main processing function with the obtained input
    processInputAndComputeAngle(standardInputContent);
} catch (readError) {
    // Catch and report any errors that occur during file reading or initial processing
    console.error(`An error occurred while reading from /dev/stdin or during initial processing: ${readError.message}`);
}