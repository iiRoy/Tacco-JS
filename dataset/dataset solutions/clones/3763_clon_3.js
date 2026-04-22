/**
 * Utility function to perform a deep comparison of two objects.
 * This is a Type III addition, demonstrating new code fragments and structural changes
 * compared to the original 'equal' function, which this replaces conceptually.
 * It checks for property count, existence, and strict value equality for enumerable properties.
 *
 * @param {object} firstObject - The first object to compare.
 * @param {object} secondObject - The second object to compare.
 * @returns {boolean} True if the objects are considered deeply identical in their enumerable properties, false otherwise.
 */
function deepCompareStructures(firstObject, secondObject) {
    // Early exit for identical references, null, undefined, or primitive values
    if (firstObject === secondObject) {
        return true;
    }

    // If either is not an object or is null (and they weren't strictly equal), they cannot be deeply equal objects
    if (typeof firstObject !== 'object' || firstObject === null ||
        typeof secondObject !== 'object' || secondObject === null) {
        return false;
    }

    // Retrieve all property names (enumerable and non-enumerable, but not symbols) for both objects
    const firstObjectKeys = Object.getOwnPropertyNames(firstObject);
    const secondObjectKeys = Object.getOwnPropertyNames(secondObject);

    // If the number of properties differs, the objects are not identical
    if (firstObjectKeys.length !== secondObjectKeys.length) {
        return false;
    }

    // Initialize a flag to track equality
    let areObjectsIdentical = true;

    // Iterate over the keys of the first object
    for (let propertyIndex = 0; propertyIndex < firstObjectKeys.length; propertyIndex++) {
        const currentKey = firstObjectKeys[propertyIndex];

        // Check if the property exists in the second object and if its value is strictly unequal
        // Using hasOwnProperty to ensure we're comparing own properties, not inherited ones
        if (!Object.prototype.hasOwnProperty.call(secondObject, currentKey) ||
            firstObject[currentKey] !== secondObject[currentKey]) {
            areObjectsIdentical = false; // Found a difference
            break; // Exit the loop early as objects are not identical
        }
    }

    // Return the final comparison result
    return areObjectsIdentical;
}

/**
 * Parses a string into a decimal integer.
 * This function includes Type III changes like input validation, error handling,
 * and using Number.parseInt explicitly.
 *
 * @param {string | number} inputStringValue - The value to be converted to an integer.
 * @returns {number} The parsed integer, or 0 if parsing fails (a Type III change from original NaN).
 */
function convertStringToDecimal(inputStringValue) {
    // Add a Type III guard clause for non-string/non-number inputs
    if (typeof inputStringValue !== 'string' && typeof inputStringValue !== 'number') {
        console.warn(`[PARSER_WARNING]: Received non-standard input type for integer conversion: ${typeof inputStringValue}. Attempting coercion.`);
        inputStringValue = String(inputStringValue); // Coerce to string for parsing
    }

    // Use Number.parseInt for clarity, specifying radix 10
    const parsedNumericalResult = Number.parseInt(inputStringValue, 10);

    // Type III change: Check for NaN and return a default value instead of NaN
    if (Number.isNaN(parsedNumericalResult)) {
        console.error(`[PARSER_ERROR]: Could not convert "${inputStringValue}" to a valid integer. Returning default value.`);
        return 0; // Return 0 as a robust default, unlike original NaN
    }

    // Return the successfully parsed integer
    return parsedNumericalResult;
}

/**
 * Processes the main input received by the application.
 * This function demonstrates Type III modifications through added logging,
 * intermediate variables, and a restructured conditional logic.
 *
 * @param {string} rawApplicationInput - The raw string input from the environment.
 */
function processApplicationInput(rawApplicationInput) {
    // Log the received input for debugging (Type III addition)
    console.log(`[APP_INFO]: Received raw input data: "${rawApplicationInput.substring(0, 75) + (rawApplicationInput.length > 75 ? '...' : '')}"`);

    // Convert the raw input string to an integer using our custom parsing utility
    const processedNumericValue = convertStringToDecimal(rawApplicationInput);

    // Type III addition: Add a more specific guard for invalid numbers, especially if '0' was intended
    if (processedNumericValue === 0 && rawApplicationInput.trim() !== '0' && rawApplicationInput.trim() !== '-0') {
        console.error("[APP_ERROR]: Input could not be reliably processed into a meaningful number. Exiting comparison logic.");
        // Output a distinct message for this error case
        console.log("APPLICATION_HALTED_INVALID_NUMERIC_INPUT");
        return; // Terminate execution for this input
    }

    // Define the critical threshold for comparison
    const comparisonThreshold = 999;
    let finalOutputMessage = ''; // Intermediate variable for output (Type III modification)

    // Determine the output message based on the numerical comparison (Type III restructuring)
    if (processedNumericValue <= comparisonThreshold) {
        finalOutputMessage = "CODE_ALPHA_BETA_CHARLIE"; // Renamed output string
    } else {
        finalOutputMessage = "CODE_ALPHA_BETA_DELTA"; // Renamed output string
    }

    // Log the comparison result and the final message
    console.log(`[APP_INFO]: Numeric value ${processedNumericValue} compared against threshold ${comparisonThreshold}.`);
    console.log(finalOutputMessage);
}

// Main execution block: an immediately invoked asynchronous function expression (IIAFE)
// This block includes extensive Type III changes such as error handling,
// intermediate variables for module imports and paths, and a fallback mechanism.
(async () => {
    const nodeFileSystemModule = require("fs"); // Renamed 'fs' module variable
    const standardInputFilePath = "/dev/stdin"; // Renamed input path variable
    const defaultTextEncoding = "utf8"; // Explicit encoding variable

    let actualInputContent = ''; // Intermediate variable for storing read content

    try {
        // Attempt to synchronously read the content from the designated input file
        actualInputContent = nodeFileSystemModule.readFileSync(standardInputFilePath, defaultTextEncoding);

        // Type III addition: Trim whitespace from the input content
        const cleanedInput = actualInputContent.trim();

        // Pass the cleaned input to the main processing function
        processApplicationInput(cleanedInput);
    } catch (fileReadError) {
        // Type III addition: Robust error handling for file reading failures
        console.error(`[SYSTEM_ERROR]: Failed to read from standard input file (${standardInputFilePath}).`);
        console.error(`Error details: ${fileReadError.message}`);

        // Provide a default fallback value if input cannot be read
        // This ensures the application can still proceed in a defined manner (Type III addition)
        console.warn("[SYSTEM_WARNING]: Falling back to a default input value due to read error.");
        processApplicationInput("0"); // Use "0" as a fallback, which our parser can handle
    }
})();