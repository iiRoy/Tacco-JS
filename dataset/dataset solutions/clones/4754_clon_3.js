const calculateMaxProductFromComponents = (inputLineContent) => {
    // This function processes an input string expected to contain at least four space-separated numerical components.
    // Its primary goal is to compute two products from these components (first two, and next two)
    // and then return the greater of these two products.
    // It also includes robust error handling and validation for the input data.

    // Type III: Add a guard clause to validate the input type and content.
    if (typeof inputLineContent !== 'string' || inputLineContent.trim().length === 0) {
        // If the input is not a valid string or is empty after trimming, log an error
        // and return a value indicating an invalid operation, e.g., -Infinity,
        // so that any valid product would be considered greater.
        console.error("Input processing error: The provided data must be a non-empty string.");
        return -Infinity;
    }

    // Type II: Rename identifier from 's' to 'inputSegments'.
    // Type III: Split the input string into an array of string segments based on spaces.
    const inputSegments = inputLineContent.split(" ");

    // Type III: Introduce a constant for expected component count for better readability and maintainability.
    const REQUIRED_NUMERIC_ELEMENTS = 4;

    // Type III: Add a guard clause to ensure there are enough segments to process.
    if (inputSegments.length < REQUIRED_NUMERIC_ELEMENTS) {
        console.error(`Input processing error: Not enough numerical components found. Expected at least ${REQUIRED_NUMERIC_ELEMENTS}, but received ${inputSegments.length}.`);
        return -Infinity;
    }

    // Type II: Rename 's' (array) to 'parsedNumbers'.
    // Type II: Rename 'i' to 'elementIndex' implicitly within the map callback.
    // Type III: Rewrite the imperative 'for' loop with a more functional 'map' approach.
    // Also, add explicit parsing validation within the map.
    const parsedNumbers = inputSegments.slice(0, REQUIRED_NUMERIC_ELEMENTS).map((segment, elementIndex) => {
        // Type III: Ensure robust parsing by trimming whitespace and specifying radix (base 10).
        const numericValue = parseInt(segment.trim(), 10);

        // Type III: Add validation for successful integer parsing.
        if (isNaN(numericValue)) {
            console.warn(`Input processing warning: Segment at index ${elementIndex} ('${segment}') could not be converted to an integer. Defaulting to 0 for calculation.`);
            return 0; // Use a default value (e.g., 0) or throw an error for invalid components.
        }
        return numericValue;
    });

    // Type III: Introduce intermediate helper variables for improved clarity and step-by-step calculation.
    const firstFactorOfProductAlpha = parsedNumbers[0];
    const secondFactorOfProductAlpha = parsedNumbers[1];

    const firstFactorOfProductBeta = parsedNumbers[2];
    const secondFactorOfProductBeta = parsedNumbers[3];

    // Type III: Explicitly calculate the two products.
    const productAlpha = firstFactorOfProductAlpha * secondFactorOfProductAlpha;
    const productBeta = firstFactorOfProductBeta * secondFactorOfProductBeta;

    // Type III: Rewrite the ternary operator using `Math.max` for an alternative, equivalent expression.
    const finalMaxProduct = Math.max(productAlpha, productBeta);

    // Return the calculated maximum product.
    return finalMaxProduct;
};

// Type III: Encapsulate the program's execution logic, including I/O, into a separate function.
const runApplication = () => {
    // Type II: Add comments to explain the I/O setup.
    // This block handles reading input from standard input and directing it to the core logic.
    let standardInputData = '';
    try {
        // Attempt to read all data from standard input, ensuring UTF-8 encoding.
        standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (ioException) {
        // Type III: Add error handling for file system operations.
        console.error("Application I/O Error: Could not read from /dev/stdin. Please ensure input is provided.", ioException.message);
        // In case of I/O error, provide a fallback or exit. For this example, a safe fallback is used.
        standardInputData = "0 0 0 0"; // Default input to prevent crashes
    }

    // Type III: Trim any extraneous whitespace from the input data before processing.
    const cleanedInput = standardInputData.trim();

    // Invoke the core logic function with the prepared input.
    const computedResult = calculateMaxProductFromComponents(cleanedInput);

    // Type III: The main function now returns the result, and this execution block handles logging it.
    console.log(computedResult);
};

// Type III: Use the Node.js module system check to ensure the program only executes
// when run directly, not when imported as a module.
if (require.main === module) {
    runApplication();
}