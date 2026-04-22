'use strict'; // Enforce stricter parsing and error handling for robust code execution

/**
 * Analyzes a given block of raw text input to calculate the numerical span
 * between the highest and lowest unique integer values found on its second line.
 * This function assumes the input format includes multiple lines, with the
 * relevant numeric data being present on the second line, separated by spaces.
 *
 * @param {string} fullInputContent - The complete input data as a single string,
 *                                    typically sourced from a file or standard input.
 * @returns {void} The computed range (maximum - minimum) is printed to the console.
 *                 In case of errors or insufficient data, an error message is
 *                 logged, and a default value (e.g., 0) might be printed.
 */
function determineValueRange(fullInputContent) {
    // Divide the entire input content into an array of individual text lines.
    // The regular expression `/\r?\n/` ensures compatibility with both
    // Windows-style (`\r\n`) and Unix-style (`\n`) line endings.
    const contentSegments = fullInputContent.split(/\r?\n/);

    // Implement an initial validation check: ensure there are enough lines
    // in the input for meaningful processing. We specifically need the second line.
    if (contentSegments.length < 2) {
        console.error('Processing Error: Input data contains an insufficient number of lines. At least two lines are required.');
        console.log(0); // Output 0 as a default for invalid input structure
        return; // Terminate execution due to invalid input
    }

    // The first line often contains metadata (like a total count 'n'),
    // which is not directly used in this particular range calculation.
    // For example: const initialCount = parseInt(contentSegments[0], 10);

    // Retrieve the second line of the input, which is expected to hold the sequence of numbers.
    const numberSequenceString = contentSegments[1];

    // Validate the extracted number sequence string: it should not be empty
    // or consist solely of whitespace characters.
    if (!numberSequenceString || numberSequenceString.trim().length === 0) {
        console.error('Processing Error: The designated second line for numeric data is either empty or contains only whitespace.');
        console.log(0); // Output 0 for empty numeric data
        return; // Halt processing
    }

    // Break down the number sequence string into individual string tokens
    // using space as a delimiter. Filter out any empty tokens that might
    // arise from consecutive spaces.
    const individualTokens = numberSequenceString.split(' ').filter(token => token.trim().length > 0);

    // If no valid tokens remain after splitting and filtering, there's no data to process.
    if (individualTokens.length === 0) {
        console.error('Processing Error: No distinct numeric tokens were identified within the input string.');
        console.log(0); // Output 0 if no numbers are found
        return; // Abort further calculations
    }

    // Utilize a JavaScript Set to efficiently collect and maintain only unique
    // numerical values, automatically handling duplicate entries.
    const uniqueNumericValues = new Set();
    for (const token of individualTokens) {
        // Convert each string token into a numerical type. `Number()` is used
        // as a flexible alternative to `parseInt()` or bitwise `~~` operator.
        const numericConversion = Number(token);

        // Only add values that successfully converted to a number (i.e., not NaN)
        // to our set of unique numbers.
        if (!isNaN(numericConversion)) {
            uniqueNumericValues.add(numericConversion);
        }
    }

    // After populating the set, verify that we have at least two distinct numbers.
    // A range (max - min) cannot be calculated with fewer than two unique values.
    if (uniqueNumericValues.size < 2) {
        console.error('Processing Error: Insufficient distinct numerical values (' + uniqueNumericValues.size + ' found) to compute a meaningful range.');
        console.log(0); // If 0 or 1 unique numbers, the range is 0.
        return; // Conclude execution
    }

    // Transform the Set of unique numbers into an array. This step is crucial
    // for leveraging `Math.min()` and `Math.max()` with the spread operator.
    // This approach avoids the need to sort the entire array, which was
    // a characteristic of the original implementation.
    const finalNumericCollection = Array.from(uniqueNumericValues);

    // Identify the absolute smallest and largest values within the collection
    // of unique numbers. The spread operator (`...`) unpacks the array elements
    // as arguments for `Math.min()` and `Math.max()`.
    const lowestObservedValue = Math.min(...finalNumericCollection);
    const highestObservedValue = Math.max(...finalNumericCollection);

    // Compute the ultimate numerical span by subtracting the minimum value
    // from the maximum value.
    const calculatedSpanResult = highestObservedValue - lowestObservedValue;

    // Output the final computed range to the standard output stream.
    console.log(calculatedSpanResult);
}

// This is the primary execution block.
// It synchronously reads all content from the standard input (`/dev/stdin`)
// as a UTF-8 encoded string. The obtained raw content is then passed
// to our `determineValueRange` function for processing.
determineValueRange(require('fs').readFileSync('/dev/stdin', 'utf8'));