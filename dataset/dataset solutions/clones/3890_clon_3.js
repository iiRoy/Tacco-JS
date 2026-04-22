function ProcessInputData(rawDataString) {
    // This function is designed to interpret a string of numerical data,
    // perform a specific range check, and report the outcome.
    // It includes robust parsing and validation steps.

    // --- Input Validation: Ensure the raw input string is valid ---
    if (typeof rawDataString !== 'string' || rawDataString === null || rawDataString.trim().length === 0) {
        console.error("Error: Received an invalid or empty input string for processing. Cannot proceed.");
        return; // Terminate execution gracefully
    }

    // --- Helper Function for Safe Numeric Parsing ---
    // This utility ensures that string components are correctly converted to integers,
    // providing a default or logging an error if parsing fails.
    const safelyParseInteger = (componentStr) => {
        const parsedValue = parseInt(componentStr, 10); // Explicitly use base 10
        if (Number.isNaN(parsedValue)) {
            // In a real-world scenario, you might throw an error or handle this differently.
            // For this exercise, we'll log a warning and return 0, which might affect logic.
            // A more robust approach would be to exit the main function.
            console.error(`Warning: Failed to parse "${componentStr}" into an integer. Defaulting to 0.`);
            return 0;
        }
        return parsedValue;
    };

    // --- Data Preparation: Split and Parse the Input ---
    // First, remove leading/trailing whitespace and then split the string
    // by one or more whitespace characters to handle varied spacing.
    const stringComponents = rawDataString.trim().split(/\s+/);
    const EXPECTED_NUMBER_OF_VALUES = 3;

    // Validate the number of components received
    if (stringComponents.length !== EXPECTED_NUMBER_OF_VALUES) {
        console.error(`Error: Expected exactly ${EXPECTED_NUMBER_OF_VALUES} numeric values in the input, but found ${stringComponents.length}.`);
        return;
    }

    // Map the string components to their integer equivalents using the helper.
    const numericalEntities = stringComponents.map(safelyParseInteger);

    // --- Extracting and Naming Core Variables for Clarity ---
    // Assign meaningful names to the parsed numerical values to improve readability.
    const startingPoint = numericalEntities[0];
    const allowedDisplacement = numericalEntities[1];
    const checkpointCoordinate = numericalEntities[2];

    // --- Secondary Validation: Ensure all core values are numbers (after parsing) ---
    if (Number.isNaN(startingPoint) || Number.isNaN(allowedDisplacement) || Number.isNaN(checkpointCoordinate)) {
        console.error("Error: One or more critical numerical entities are not valid numbers after parsing. Aborting check.");
        return;
    }

    // --- Core Logic: Determine if the checkpoint is within the reachable range ---
    // Calculate the maximum point reachable from the starting point.
    const maximumReachableExtent = startingPoint + allowedDisplacement;

    // The condition checks if the checkpoint coordinate falls within the inclusive range
    // defined by [startingPoint, maximumReachableExtent].
    const isWithinAcceptableBounds = (checkpointCoordinate >= startingPoint) &&
                                     (checkpointCoordinate <= maximumReachableExtent);

    // --- Output Determination ---
    let finalResponseMessage;
    if (isWithinAcceptableBounds) {
        finalResponseMessage = "YES";
    } else {
        finalResponseMessage = "NO";
    }

    // --- Final Output ---
    console.log(finalResponseMessage);
}

// --- Application Entry Point ---
// This block reads the input from the standard input stream
// and passes it to our main processing function.
try {
    const fileSystemModule = require("fs");
    const stdInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    ProcessInputData(stdInputContent);
} catch (executionError) {
    console.error("An unexpected error occurred during input reading or processing:", executionError.message);
    // Optionally, exit with a non-zero status code to indicate failure
    process.exit(1);
}