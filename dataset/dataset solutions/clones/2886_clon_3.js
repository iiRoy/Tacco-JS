// This script is designed to compute the sum of the interior angles of a regular polygon
// based on the number of its sides, provided as input.

/**
 * Calculates the sum of interior angles for a polygon given its number of sides.
 * This function performs input sanitization, validation, and the core geometric calculation.
 *
 * @param {string} rawInputStr - The raw string input, expected to contain a number
 *                                representing the polygon's vertex count.
 */
const calculatePolygonAngleSum = (rawInputStr) => {
    // --- Section 1: Input Preparation and Initial Conversion ---

    // Remove any leading or trailing whitespace characters from the input string.
    const cleanedInputString = rawInputStr.trim();

    // Verify if the input string is non-empty after trimming.
    // An empty string indicates a lack of valid input data.
    if (cleanedInputString.length === 0) {
        console.error("Processing halted: No valid numeric input detected after cleanup. Please provide a number.");
        return; // Terminate execution if input is invalid.
    }

    // Convert the cleaned string to a floating-point number first, then floor it
    // to ensure we work with an integer count of sides. This approach differs
    // from direct parseInt, adding a slight variation in parsing.
    const numericCandidate = Math.floor(Number(cleanedInputString));

    // --- Section 2: Robust Input Validation ---

    // Check if the conversion resulted in a valid, finite number.
    // 'isNaN' (Is Not a Number) indicates a failed conversion.
    if (isNaN(numericCandidate)) {
        console.error(`Input Error: The provided value '${cleanedInputString}' could not be interpreted as a valid number.`);
        return; // Exit if the input is not a number.
    }

    // Assign the validated numeric candidate to a more specific variable name.
    let polygonVertexCount = numericCandidate;

    // A fundamental geometric constraint: a polygon must have at least three sides (e.g., a triangle).
    // Inputs less than 3 are geometrically invalid for a standard polygon.
    if (polygonVertexCount < 3) {
        console.warn(`Validation Warning: A standard polygon requires a minimum of 3 sides. Received: ${polygonVertexCount}.`);
        console.warn("Result for non-standard count (less than 3) is conventionally undefined or 0 in some contexts.");
        // For values less than 3, we might output 0 or an error. Let's output 0 for simplicity.
        displayCalculationResult(0);
        return; // Stop further calculation for invalid side counts.
    }

    // --- Section 3: Core Angle Sum Calculation ---

    // Establish a constant for the degrees in a straight line or a triangle's sum,
    // which is a key component in the polygon angle formula.
    const straightAngleDegrees = 180;

    // Calculate the sum of the interior angles of the polygon.
    // The formula is (N - 2) * 180 degrees.
    // This implementation expresses it as N * 180 - 2 * 180, which is algebraically equivalent
    // but represents a structural change for Type III cloning.
    let finalAngleResult = (polygonVertexCount * straightAngleDegrees) - (2 * straightAngleDegrees);

    // --- Section 4: Output Presentation ---

    // Provide context to the user before displaying the final result.
    console.log(`Initiating angle sum computation for a shape possessing ${polygonVertexCount} edges...`);

    // Utilize a dedicated helper function to consistently log the calculated outcome.
    displayCalculationResult(finalAngleResult);
};

/**
 * A utility function to format and output the final calculated result.
 * This abstracts the console logging, making it easier to change output methods later.
 *
 * @param {number} valueToLog - The numerical result to be displayed.
 */
const displayCalculationResult = (valueToLog) => {
    // The output message is made more descriptive.
    console.log(`The total sum of internal angles for the specified polygon is: ${valueToLog} degrees.`);
};

// --- Main Program Execution Flow ---

// Import the Node.js built-in 'fs' (File System) module for file operations.
const fileSystemOperations = require("fs");

// Define the standard path from which input will be read in a typical Unix-like environment.
const standardInputDevicePath = "/dev/stdin";

// Implement a try-catch block to gracefully handle potential errors during file I/O.
try {
    // Synchronously read the entire content of the standard input file.
    // 'utf8' encoding ensures the content is read as a human-readable string.
    const contentFromStandardInput = fileSystemOperations.readFileSync(standardInputDevicePath, "utf8");

    // Invoke the primary function to process the data obtained from standard input.
    calculatePolygonAngleSum(contentFromStandardInput);

} catch (inputReadError) {
    // If any error occurs during the file reading process (e.g., file not found, permissions issues),
    // log an informative error message to the console.
    console.error("An unexpected I/O error occurred while attempting to retrieve input data:", inputReadError.message);
    // For advanced debugging, the full error stack could also be logged:
    // console.error(inputReadError.stack);
}

// End of script execution.