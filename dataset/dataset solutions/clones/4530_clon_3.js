const fs = require('fs');

/**
 * Processes raw input string content to categorize numerical data.
 * It reads a size from the first line and a series of numbers from the second,
 * then categorizes each number based on a division and threshold.
 *
 * @param {string} inputStringContent - The raw multi-line string input, typically from a file.
 */
function processInputData(inputStringContent) {
    // Split the entire input content into individual lines for structured processing.
    const linesOfData = inputStringContent.split('\n');

    // --- Input Validation: Ensure minimum required lines are present ---
    if (!linesOfData || linesOfData.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        // In a real application, one might throw an error or log more extensively.
        return;
    }

    // Parse the first line to determine the expected number of data elements.
    // .trim() is used to remove any leading/trailing whitespace.
    const expectedDataSize = parseInt(linesOfData[0].trim(), 10);

    // --- Input Validation: Check for a valid numerical data size ---
    if (isNaN(expectedDataSize) || expectedDataSize < 0) {
        console.error("Error: Invalid or negative data size specified in the first line.");
        return;
    }

    // Split the second line into individual string representations of numbers.
    // This line contains the actual data points to be categorized.
    const stringNumbers = linesOfData[1].split(' ');

    // --- Intermediate Step: Convert string numbers to actual numeric values ---
    // Filter out any empty strings that might result from multiple spaces between numbers,
    // then map the remaining strings to their numerical equivalents.
    const numericValues = stringNumbers
        .filter(s => s.trim() !== '') // Remove empty strings from potential extra spaces
        .map(Number); // Convert each valid string to a number

    // --- Input Validation: Compare actual data points with the expected count ---
    if (numericValues.length !== expectedDataSize) {
        console.warn(`Warning: Expected ${expectedDataSize} data points based on the first line, but found ${numericValues.length}. Processing available data.`);
        // This is a soft warning, allowing processing to continue with available data.
    }

    // --- Core Logic Variables: Using a Set for efficient unique category tracking ---
    // A Set automatically handles uniqueness, making 'indexOf' checks unnecessary.
    const uniqueCategorySet = new Set();
    // Counter for items that fall into the 'overflow' category, which are not unique categories.
    let overflowCounter = 0;

    // --- Configuration Constants: Define magic numbers for clarity and easy modification ---
    const CATEGORY_DIVISOR = 400;       // The value used to divide numbers for categorization.
    const OVERFLOW_THRESHOLD = 7;       // Category value above which an item is considered 'overflow'.

    // Iterate through each numerical value to apply categorization logic.
    for (let currentIdx = 0; currentIdx < numericValues.length; ++currentIdx) {
        const currentValue = numericValues[currentIdx];

        // --- Data Point Validation: Skip non-numeric individual data points ---
        if (isNaN(currentValue)) {
            console.warn(`Warning: Skipping non-numeric value encountered at index ${currentIdx}: '${stringNumbers[currentIdx]}'.`);
            continue; // Move to the next item if the current one is not a valid number.
        }

        // Calculate the category for the current number.
        // Math.floor ensures that the category is always an integer.
        const calculatedCategory = Math.floor(currentValue / CATEGORY_DIVISOR);

        // --- Conditional Logic: Determine if the category is an 'overflow' type ---
        const isOverflowCategory = calculatedCategory > OVERFLOW_THRESHOLD;

        if (isOverflowCategory) {
            overflowCounter++; // Increment the counter for overflow items.
        } else {
            // Add the category to the Set. If it's already present, the Set will ignore it.
            uniqueCategorySet.add(calculatedCategory);
        }
    }

    // --- Final Result Aggregation: Prepare output values ---
    // Retrieve the total count of distinct categories found.
    const distinctCategoryCount = uniqueCategorySet.size;
    // Calculate the overall total count, including both distinct categories and overflow items.
    const totalProcessedCount = distinctCategoryCount + overflowCounter;

    // Output the final results, formatted as two space-separated numbers.
    console.log(`${distinctCategoryCount} ${totalProcessedCount}`);
}

// --- Main Execution Block: Reads from standard input and handles errors ---
// Define the standard input file path as a constant.
const inputFilePath = "/dev/stdin";

try {
    // Read the entire content of the specified input file synchronously.
    const fileContent = fs.readFileSync(inputFilePath, "utf8");
    // Invoke the main processing function with the content read from the file.
    processInputData(fileContent);
} catch (error) {
    // --- Error Handling: Catch and report issues during file reading ---
    console.error(`Failed to read input from ${inputFilePath}. Error details:`, error.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}