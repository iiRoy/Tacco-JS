// This module is designed to process an incoming text payload,
// extracting numerical values to perform a specific mathematical computation.
// The primary goal is to determine the character length of a given integer
// when it is represented in an arbitrary numerical base (radix).

function processInputData(rawTextPayload) {

    /**
     * A utility function to compute the number of digits required to represent
     * a given integer in a specified numerical base. This implementation
     * provides an alternative to using the built-in Number.prototype.toString(radix).length.
     * It handles positive, negative, and zero values, and validates the radix.
     *
     * @param {number} valueToConvert - The integer whose representation length is to be calculated.
     * @param {number} targetRadix - The base (radix) for the conversion, must be an integer >= 2.
     * @returns {number} The count of digits in the specified base, or 0 if an invalid radix is provided.
     */
    const calculateRepresentationLength = (valueToConvert, targetRadix) => {
        // Ensure the target base is a valid integer and at least 2.
        // Bases less than 2 are mathematically undefined for standard positional numeral systems.
        if (targetRadix < 2 || !Number.isInteger(targetRadix)) {
            console.error("Error: The provided conversion base is invalid. It must be an integer greater than or equal to 2.");
            return 0; // Return 0 to indicate an unprocessable request due to bad base.
        }

        // Special handling for the number zero, which always has a length of 1 ('0')
        // in any valid base.
        if (valueToConvert === 0) {
            return 1;
        }

        let segmentLength = 0;
        let workingValue = valueToConvert;

        // If the number is negative, one character is reserved for the minus sign.
        // We then proceed with the absolute value for digit counting.
        if (workingValue < 0) {
            segmentLength = 1; // Account for the '-' symbol
            workingValue = Math.abs(workingValue);
        }

        // Continuously divide the number by the target base until it becomes zero.
        // Each division represents one digit in the new base.
        while (workingValue > 0) {
            workingValue = Math.floor(workingValue / targetRadix);
            segmentLength++; // Increment the digit counter for each successful division
        }

        return segmentLength;
    };

    // First, sanitize the raw input by trimming any leading/trailing whitespace
    // and then extracting only the first line of content.
    const principalInputLine = rawTextPayload.trim().split('\n')[0];

    // Split the extracted line by spaces to separate the numeric value and the base.
    const numericalStringParts = principalInputLine.split(' ');

    // Implement a guard clause to ensure the input line contains at least two parts.
    // If not, the input format is incorrect, and processing cannot continue.
    if (numericalStringParts.length < 2) {
        console.error("Input format error: Expecting two space-separated numbers on the first line.");
        return;
    }

    // Attempt to parse the string parts into integer numerical values.
    // The radix '10' is explicitly provided for safety, ensuring decimal parsing.
    const primaryNumericValue = parseInt(numericalStringParts[0], 10);
    const targetConversionBase = parseInt(numericalStringParts[1], 10);

    // Comprehensive validation checks for the parsed numerical values.
    // This includes checking for successful parsing (not NaN) and ensuring they are integers.
    if (isNaN(primaryNumericValue) || isNaN(targetConversionBase)) {
        console.error("Parsing error: Unable to convert one or both input segments into valid numbers.");
        return;
    }
    if (!Number.isInteger(primaryNumericValue) || !Number.isInteger(targetConversionBase)) {
        console.error("Input validation error: Both input values must be whole integers.");
        return;
    }

    // A final check on the target base, ensuring it meets the minimum requirement
    // before passing it to the calculation function.
    if (targetConversionBase < 2) {
        console.error("Input validation error: The conversion base must be an integer of 2 or greater.");
        return;
    }

    // Execute the core calculation using the refined helper function.
    const finalCalculatedLength = calculateRepresentationLength(primaryNumericValue, targetConversionBase);

    // Output the computed length to the standard output stream.
    console.log(finalCalculatedLength);
}

// This specific block is responsible for reading the entire standard input
// and then passing it to the main processing function.
// It is typically left unaltered in competitive programming contexts.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));