const fileSystemAccessor = require('fs'); // Renamed module import for file system operations
const standardInputResourcePath = '/dev/stdin'; // Standard input file path constant

/**
 * Fetches raw textual data from a specified file path.
 * This function handles synchronous file reading operations.
 * @param {string} sourcePath The absolute path to the input file, e.g., '/dev/stdin'.
 * @returns {string} The entire content of the file as a UTF-8 string.
 */
function retrieveRawTextualInput(sourcePath) {
    // Adding descriptive comments (Type II change)
    // Ensures the data is read in a universal text encoding to prevent character issues.
    return fileSystemAccessor.readFileSync(sourcePath, 'utf8');
}

/**
 * Transforms a raw string containing space-separated numbers into an array of numerical values.
 * Includes robust parsing and filtering for non-numeric tokens, ensuring only valid numbers are returned.
 * @param {string} rawStringSequence The input string, for example, "10 20 30 40".
 * @returns {number[]} An array containing only valid numerical elements extracted from the input string.
 */
function extractNumericalTokens(rawStringSequence) {
    // Type II: Renaming variables and methods for clarity.
    // Type III: Introducing intermediate cleaning steps and enhanced input validation.
    const processedString = rawStringSequence.trim(); // Trim leading/trailing whitespace for clean parsing
    const delimitedTokens = processedString.split(' '); // Split the string by space character to get individual tokens

    // Type III: Enhanced validation for empty or malformed input.
    // If the input string yields no meaningful tokens, an empty array is returned.
    if (delimitedTokens.length === 0 || (delimitedTokens.length === 1 && delimitedTokens[0] === '')) {
        // A warning could be logged here, but for this problem, we'll proceed with an empty array.
        return [];
    }

    // Type III: Use a dedicated helper function for number conversion and filtering.
    // This improves readability and reusability for the mapping operation.
    const convertAndValidateNumber = (tokenString) => {
        const numericValue = Number(tokenString); // Attempt to convert string token to a number
        // Check for NaN (Not-a-Number) and return null to facilitate filtering out invalid entries.
        return isNaN(numericValue) ? null : numericValue;
    };

    // Apply the conversion function to each token and then filter out any null values (invalid numbers).
    const validNumbers = delimitedTokens.map(convertAndValidateNumber).filter(val => val !== null);
    return validNumbers;
}

// Acquire the raw input data from the standard input path.
const rawDataPayload = retrieveRawTextualInput(standardInputResourcePath);
// Parse the numerical components from the raw input string.
const processedNumericalComponents = extractNumericalTokens(rawDataPayload);

// Type III: Implement a guard clause for insufficient input.
// The original code implicitly assumes at least two numbers (a, b) are provided.
if (processedNumericalComponents.length < 2) {
    console.error("Critical Error: Insufficient numerical data provided. At least two operands are required for processing.");
    // In a robust application, one might throw a detailed error or provide a default safe value.
    // For this problem, we'll output 'Yes' as a fallback for critical input failure and terminate.
    console.log("Yes"); // Default to 'Yes' in case of critical input error
    process.exit(1); // Terminate execution as the required input was not met
}

// Destructure the first two required operands from the processed array.
// The original code destructured four (a,b,c,d) but only used 'a' and 'b'.
// Type III: Delete unused variables ('c' and 'd') from the destructuring assignment.
const [primaryValue, secondaryValue] = processedNumericalComponents; // Renamed variables for clarity

// --- Section 2: Core Logic - Parity Analysis and Conditional Evaluation ---
// Extensive Type II: renaming, comments, reformatting.
// Extensive Type III: helper functions, intermediate variables, re-expressions of conditions,
//                     addition of seemingly complex but logically equivalent structures.

/**
 * Determines if a given integer is considered 'odd' based on its remainder when divided by two.
 * This function provides a consistent way to check parity.
 * @param {number} numValue The integer value to check for oddness.
 * @returns {boolean} True if the number is odd, false otherwise.
 */
function evaluateParityAsOdd(numValue) {
    // Type III: Using Math.abs and Math.trunc for a slightly different, but equivalent,
    // parity check, which can also handle negative numbers consistently if they were expected.
    // For positive integers, `numValue % 2 === 1` is also a valid check for odd numbers.
    return Math.abs(Math.trunc(numValue % 2)) === 1;
}

// Calculate the parity status for each of the two primary operands using the helper function.
const isPrimaryValueOdd = evaluateParityAsOdd(primaryValue); // Intermediate variable for primary operand's oddness
const isSecondaryValueOdd = evaluateParityAsOdd(secondaryValue); // Intermediate variable for secondary operand's oddness

// Type III: Introduce helper variables for the composite conditions, making the logic steps explicit.
// Original condition 1: (a+b+1)%2==0  -> This implies (a+b) is odd.
// (a+b) is odd if and only if 'a' and 'b' have different parities (one odd, one even).
const areParitiesDifferent = (isPrimaryValueOdd !== isSecondaryValueOdd);

// Original condition 2: (a*b+1)%2    -> This implies (a*b) is even.
// (a*b) is even if and only if at least one of 'a' or 'b' is even.
// This is equivalent to: NOT (both primary and secondary are odd).
const isProductParityEven = !(isPrimaryValueOdd && isSecondaryValueOdd);

// Type III: Introduce a function to encapsulate the complex conditional logic,
// making the overall structure more modular and seemingly more elaborate.
/**
 * Determines if a specific combination of conditions related to sum and product parity is met.
 * This function encapsulates the core logical evaluation of the problem.
 * @param {boolean} diffParityStatus True if the sum of operands would be odd (i.e., different parities).
 * @param {boolean} prodEvenStatus True if the product of operands would be even (i.e., at least one even operand).
 * @returns {boolean} True if both input conditions are met, false otherwise.
 */
function assessCompositeParityCriteria(diffParityStatus, prodEvenStatus) {
    // Type III: Add an extra layer of variables to hold the status, for increased verbosity.
    let conditionOneMet = diffParityStatus; // Represents if the sum is odd
    let conditionTwoMet = prodEvenStatus;   // Represents if the product is even

    let finalDecisionFlag = false; // Initialize the decision flag to false by default

    // The original logic implies: `if (conditionOne AND conditionTwo)`
    // As mathematically analyzed, if `conditionOneMet` (sum is odd) is true,
    // it inherently means one operand is odd and the other is even.
    // In such a scenario, their product MUST be even, thus `conditionTwoMet` will always be true.
    // Therefore, this nested structure effectively simplifies to checking only `conditionOneMet`.
    if (conditionOneMet) {
        if (conditionTwoMet) {
            // This inner block will always be reached if `conditionOneMet` is true,
            // because `conditionTwoMet` is a logical consequence of `conditionOneMet`.
            finalDecisionFlag = true;
        } else {
            // This 'else' block is logically unreachable for valid integer inputs given the
            // relationship between (sum is odd) and (product is even). It's added for structural complexity (Type III).
            // A warning could be logged here if this unexpected state were to occur.
        }
    } else {
        // If `conditionOneMet` (sum is odd) is false, then the main 'if' condition is already false.
        // In this case, `finalDecisionFlag` correctly remains false.
    }

    return finalDecisionFlag;
}

// Execute the composite parity assessment to get the final boolean outcome.
const shouldTriggerNegativeOutcome = assessCompositeParityCriteria(areParitiesDifferent, isProductParityEven);

// --- Section 3: Output Generation ---
// Extensive Type II: renaming, comments.
// Extensive Type III: function wrapper, conditional message selection logic.

/**
 * Delivers the final result message to the standard output console.
 * The message depends on whether the specific "No" outcome condition was met.
 * @param {boolean} outcomeFlag A boolean value indicating if the condition leading to "No" was true.
 */
function displayProcessedOutcome(outcomeFlag) {
    // Type II: Renamed output strings for better descriptive clarity.
    const negativeResultIndicator = "No"; // Corresponds to the original "No" output
    const positiveResultIndicator = "Yes"; // Corresponds to the original "Yes" output

    // Type III: Use a ternary operator for concise conditional message selection,
    // directly mimicking the original `if (condition) console.log("No"); else console.log("Yes");` structure.
    const messageToOutput = outcomeFlag ? negativeResultIndicator : positiveResultIndicator;
    
    console.log(messageToOutput); // Output the selected message to the console
}

// Final step: display the computed outcome based on the entire processing logic.
displayProcessedOutcome(shouldTriggerNegativeOutcome);