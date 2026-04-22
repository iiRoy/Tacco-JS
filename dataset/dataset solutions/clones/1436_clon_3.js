// This function is designed to calculate the Euclidean distance between two 2D points.
// It expects a string input containing four numeric values, representing (x1, y1) and (x2, y2).
function ComputeSpatialSeparation(rawInputString) {
    // Define an immutable constant for the expected number of coordinate components.
    const REQUIRED_NUM_COORDINATES = 4; // Two points, each with X and Y values.

    // Step 1: Pre-process the raw input string.
    // Remove any leading or trailing whitespace characters.
    const cleansedInput = rawInputString.trim();

    // Split the cleansed string into an array of string tokens,
    // using one or more whitespace characters (spaces, tabs, newlines) as delimiters.
    const stringTokens = cleansedInput.split(/\s+/);

    // Initial validation: Check if we have enough tokens to proceed.
    if (stringTokens.length < REQUIRED_NUM_COORDINATES) {
        // If not, log an error and terminate the function gracefully.
        console.error(`Error: Insufficient data detected. Expected at least ${REQUIRED_NUM_COORDINATES} numeric tokens, but found ${stringTokens.length}.`);
        return; // Halt execution.
    }

    // Step 2: Convert string tokens to an array of numbers.
    // Initialize an empty array to store the successfully parsed numeric values.
    const numericalComponents = [];
    // Iterate through each string token.
    for (let currentToken of stringTokens) {
        // Attempt to parse the token into an integer (base 10).
        const parsedNumber = parseInt(currentToken, 10);
        // Validate if the parsing was successful (i.e., not NaN).
        if (isNaN(parsedNumber)) {
            // If any token is not a valid number, log an error and stop.
            console.error(`Error: Found a non-numeric token '${currentToken}'. All input values must be numbers.`);
            return; // Halt execution.
        }
        // Add the valid number to our collection.
        numericalComponents.push(parsedNumber);
    }

    // Secondary validation: Ensure the parsed array contains the exact expected number of elements.
    // This helps guard against extra unexpected data.
    if (numericalComponents.length < REQUIRED_NUM_COORDINATES) {
        console.error(`Error: Parsed numeric data has fewer components (${numericalComponents.length}) than required (${REQUIRED_NUM_COORDINATES}).`);
        return; // Halt execution.
    }

    // Step 3: Extract individual coordinate values from the numeric array for clarity.
    // Point A coordinates (first point).
    const pointA_coordX = numericalComponents[0];
    const pointA_coordY = numericalComponents[1];

    // Point B coordinates (second point).
    const pointB_coordX = numericalComponents[2];
    const pointB_coordY = numericalComponents[3];

    // Step 4: Calculate the differences along the X and Y axes.
    // The horizontal displacement between the two points.
    const horizontalDelta = pointB_coordX - pointA_coordX;
    // The vertical displacement between the two points.
    const verticalDelta = pointB_coordY - pointA_coordY;

    // Step 5: Compute the square of each displacement.
    // Using Math.pow() for explicit squaring.
    const squaredHorizontalDelta = Math.pow(horizontalDelta, 2);
    const squaredVerticalDelta = Math.pow(verticalDelta, 2);

    // Step 6: Sum the squared displacements.
    // This result is the square of the straight-line distance (hypotenuse).
    const sumOfSquaredDeltas = squaredHorizontalDelta + squaredVerticalDelta;

    // Step 7: Calculate the final Euclidean distance by taking the square root of the sum.
    const euclideanDistanceResult = Math.sqrt(sumOfSquaredDeltas);

    // Step 8: Output the calculated distance to the console.
    console.log(euclideanDistanceResult);
}

// --- Application Execution Block ---
// This section handles the environment-specific input reading and function invocation.
try {
    // Utilize Node.js 'fs' module to read content from standard input synchronously.
    // '/dev/stdin' is the conventional path for standard input on Unix-like systems.
    // 'utf8' encoding ensures text is read correctly.
    const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke our primary function with the content read from standard input.
    ComputeSpatialSeparation(systemInputContent);

} catch (ioError) {
    // If any error occurs during the file system read operation, catch it here.
    // Log a descriptive error message including the specific error details.
    console.error("Failed to read input from standard input stream:", ioError.message);
    // Depending on application requirements, one might choose to exit the process
    // with a non-zero status code here, or provide a fallback.
}