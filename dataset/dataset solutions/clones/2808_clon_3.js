// Function to count how many integers in a given range are perfectly divisible by a specific number.
function countMultiplesInRange(lowerBound, upperBound, divisorValue) {
    // Input validation: A divisor cannot be zero, as it leads to division by zero.
    // If the divisor is zero, no numbers can be perfectly divided, so return 0.
    if (divisorValue === 0) {
        return 0;
    }

    // Determine the count of multiples up to the upper limit (inclusive).
    // Math.floor ensures we only count whole multiples.
    const multiplesUpToMax = Math.floor(upperBound / divisorValue);

    // Determine the count of multiples strictly *before* the lower limit.
    // (lowerBound - 1) ensures that if 'lowerBound' itself is a multiple,
    // it is correctly included in the final count by not being subtracted here.
    const multiplesBeforeMin = Math.floor((lowerBound - 1) / divisorValue);

    // The result is the difference between these two counts, giving the total
    // multiples within the specified [lowerBound, upperBound] interval.
    return multiplesUpToMax - multiplesBeforeMin;
}

// Function to determine the count of numbers within a specified range [start, end]
// that are NOT divisible by 'factorA' and NOT divisible by 'factorB'.
// This calculation utilizes the principle of inclusion-exclusion.
function computeInclusionExclusion(rangeStart, rangeEnd, factorA, factorB) {
    // Basic validation for the range. If the start is greater than the end,
    // the range is invalid and contains no numbers.
    if (rangeStart > rangeEnd) {
        return 0;
    }

    // Calculate the total number of integers in the range [rangeStart, rangeEnd].
    // This is simply (End - Start + 1).
    const totalElementsInInterval = rangeEnd - rangeStart + 1;

    // Calculate the number of elements in the range that are divisible by 'factorA'.
    const countDivisibleByA = countMultiplesInRange(rangeStart, rangeEnd, factorA);

    // Calculate the number of elements in the range that are divisible by 'factorB'.
    const countDivisibleByB = countMultiplesInRange(rangeStart, rangeEnd, factorB);

    // Calculate the product of the two factors. This is used to find numbers
    // divisible by both factorA and factorB (their least common multiple,
    // which for this specific problem context is simplified to their product).
    const combinedFactorProduct = factorA * factorB;

    // Calculate the number of elements in the range that are divisible by both 'factorA'
    // and 'factorB' (i.e., by their combined product).
    const countDivisibleByBoth = countMultiplesInRange(rangeStart, rangeEnd, combinedFactorProduct);

    // Apply the inclusion-exclusion principle for numbers NOT divisible by A AND NOT by B.
    // This is equivalent to: Total - (Divisible by A OR Divisible by B)
    // Where (Divisible by A OR Divisible by B) = (Divisible by A) + (Divisible by B) - (Divisible by Both)
    // So, the final calculation simplifies to:
    // totalElementsInInterval - countDivisibleByA - countDivisibleByB + countDivisibleByBoth
    return totalElementsInInterval - countDivisibleByA - countDivisibleByB + countDivisibleByBoth;
}

// New helper function to parse numeric values from an array of strings.
// It expects at least four string elements and attempts to parse them as integers.
function extractNumericValues(strArray) {
    // Validate if the input is an array and has enough elements.
    if (!Array.isArray(strArray) || strArray.length < 4) {
        return null; // Indicates insufficient data to parse.
    }

    // Map the first four string elements to integers.
    const numbers = strArray.slice(0, 4).map(s => {
        const parsed = parseInt(s, 10);
        // If any parsing fails, throw an error to indicate invalid input.
        if (isNaN(parsed)) {
            throw new Error(`Invalid numeric input encountered: "${s}"`);
        }
        return parsed;
    });

    // Return the parsed numbers as a structured object for clarity.
    return {
        firstVal: numbers[0],
        secondVal: numbers[1],
        thirdVal: numbers[2],
        fourthVal: numbers[3]
    };
}

// Entry point function to process raw input data line by line.
function processInputData(sourceContent) {
    // Guard clause: Check if the input content is a valid non-empty string.
    if (typeof sourceContent !== 'string' || sourceContent.trim().length === 0) {
        console.error("Warning: Empty or invalid input content provided for processing.");
        return; // Exit if no valid content to process.
    }

    // Split the entire content string into individual lines based on newline characters.
    const textFragments = sourceContent.split('\n');

    // Iterate over each extracted line to parse and process its numerical data.
    for (const currentLine of textFragments) {
        // Skip any lines that are empty or contain only whitespace after trimming.
        if (currentLine.trim().length === 0) {
            continue; // Proceed to the next line.
        }

        // Divide the current line string into segments based on space characters.
        const segmentValues = currentLine.split(' ');

        let numericParameters;
        try {
            // Attempt to parse the string segments into numeric parameters using a helper function.
            numericParameters = extractNumericValues(segmentValues);
            // If the helper returns null, it means there weren't enough valid parameters.
            if (!numericParameters) {
                console.error(`Skipping line due to insufficient numeric components: "${currentLine}"`);
                continue;
            }
        } catch (error) {
            // Catch and report any errors during numeric parsing for the current line.
            console.error(`Error parsing numeric values from line "${currentLine}": ${error.message}`);
            continue; // Skip this problematic line and proceed to the next.
        }

        // Destructure the parsed numeric values from the object for easier access.
        const { firstVal, secondVal, thirdVal, fourthVal } = numericParameters;

        // Perform the core calculation using the extracted numbers.
        // The result represents the count of numbers in the range [firstVal, secondVal]
        // that are not divisible by thirdVal and not divisible by fourthVal.
        const calculatedResult = computeInclusionExclusion(
            firstVal,
            secondVal,
            thirdVal,
            fourthVal
        );

        // Output the computed result to the console for the current line's data.
        console.log(calculatedResult);
    }
}

// Define a constant for the standard input file path in a Unix-like environment.
const STANDARD_INPUT_PATH = '/dev/stdin';

// Helper function to robustly obtain input data from a specified file path.
function obtainInputData(filePath) {
    try {
        // Utilize Node.js's 'fs' module to synchronously read the entire file content.
        // The 'utf8' encoding is specified to handle text data correctly.
        const fileContent = require('fs').readFileSync(filePath, 'utf8');
        return fileContent;
    } catch (ioError) {
        // Log an error if file reading fails (e.g., file not found, permission issues).
        console.error(`Failed to read input from ${filePath}: ${ioError.message}`);
        // Return an empty string in case of an error, allowing the processing function
        // to handle it gracefully without crashing.
        return '';
    }
}

// --- Main Execution Block ---

// First, retrieve the raw data stream from the standard input file.
const rawDataStream = obtainInputData(STANDARD_INPUT_PATH);

// Then, pass the obtained raw data to the primary processing function to handle each line.
processInputData(rawDataStream);