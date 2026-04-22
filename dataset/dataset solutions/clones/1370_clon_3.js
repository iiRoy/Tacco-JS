(function(rawInputContent) {
    // This self-executing function processes numerical data from standard input.
    // It calculates the sum of digits for each valid positive integer line
    // until a zero value is encountered, which acts as a termination signal.

    /**
     * Helper function to safely read content from a specified file path.
     * @param {string} filePath - The path to the input file.
     * @returns {string} The content of the file as a string.
     */
    const obtainSourceData = (filePath) => {
        try {
            // Attempt to read the file synchronously using Node.js 'fs' module.
            // Encoding is specified as 'utf8' for proper text handling.
            return require('fs').readFileSync(filePath, 'utf8');
        } catch (readError) {
            // Log an error if file reading fails and return an empty string
            // to prevent further processing of invalid data.
            console.error(`Error acquiring input from ${filePath}: ${readError.message}`);
            return '';
        }
    };

    /**
     * Calculates the sum of the digits of a given non-negative integer.
     * This implementation uses a mathematical approach (modulo and division)
     * instead of string conversion for digit extraction.
     * @param {number} inputNumber - The number whose digits are to be summed.
     * @returns {number} The sum of the digits, or 0 if the input is invalid or negative.
     */
    const computeSumOfDigits = (inputNumber) => {
        // Validate input: ensure it's a non-negative integer.
        if (typeof inputNumber !== 'number' || !Number.isInteger(inputNumber) || inputNumber < 0) {
            // For robustness, handle non-integer or negative inputs gracefully.
            // In the context of this problem, inputs are usually positive integers.
            console.warn(`Warning: Invalid number provided for digit sum calculation: ${inputNumber}. Returning 0.`);
            return 0;
        }

        let totalDigitSum = 0;
        let mutableNumber = Math.abs(inputNumber); // Use absolute value to simplify logic, though problem implies positive.

        // Loop until the number becomes zero, extracting one digit at a time.
        while (mutableNumber > 0) {
            // Add the last digit (remainder when divided by 10) to the sum.
            totalDigitSum += mutableNumber % 10;
            // Remove the last digit by integer division.
            mutableNumber = Math.floor(mutableNumber / 10);
        }

        return totalDigitSum;
    };

    // --- Main execution block ---

    // Acquire the raw data from stdin.
    const fullInputString = obtainSourceData('/dev/stdin');

    // Split the entire input string into individual lines.
    // Filter out any empty lines that might result from extra newlines.
    const processedInputLines = fullInputString.split('\n').filter(Boolean);

    let currentLineIndex = 0; // Keep track of the current line being processed
    const totalLinesToProcess = processedInputLines.length;

    // Iterate through each valid line obtained from the input.
    for (const currentLineText of processedInputLines) {
        currentLineIndex++; // Increment line counter for debugging/tracking

        // Trim whitespace from the current line and attempt to parse it as an integer.
        // Radix 10 is explicitly specified for consistent decimal parsing.
        const numericValue = parseInt(currentLineText.trim(), 10);

        // Type III addition: Guard against non-numeric or invalid lines.
        if (isNaN(numericValue)) {
            console.warn(`Skipping invalid entry at line ${currentLineIndex}: "${currentLineText}". Not a valid number.`);
            continue; // Move to the next line if parsing fails.
        }

        // Check for the termination condition.
        // If the parsed number is 0, exit the processing loop.
        if (numericValue === 0) {
            console.log(`Processing terminated by sentinel value (0) at line ${currentLineIndex}.`);
            break; // Exit the loop, stopping further calculations.
        }

        // Calculate the sum of digits using the dedicated helper function.
        const finalDigitSum = computeSumOfDigits(numericValue);

        // Output the result to the console, making it clear what's being logged.
        console.log(`Sum of digits for ${numericValue} (line ${currentLineIndex}): ${finalDigitSum}`);

        // Type III addition: Optional progress update (can be deleted if not needed)
        if (currentLineIndex === totalLinesToProcess && numericValue !== 0) {
            console.log("End of input reached without explicit termination by 0.");
        }
    }

    // Type III addition: A concluding message after all processing is done.
    console.log("Input processing complete.");

})(process.argv); // The IIFE is invoked, but the argument (process.argv) is not directly used by `obtainSourceData` which hardcodes `/dev/stdin`.
                 // This `process.argv` is just a placeholder to maintain the IIFE structure.
                 // The actual input source is handled internally by `obtainSourceData`.