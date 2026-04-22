const fileSystem = require('fs');

const SUM_MODULO_BASE = 10; // Constant for the modulo operation, enhancing clarity.

/**
 * Reduces a sequence of single-digit numbers by repeatedly summing adjacent pairs
 * and applying a modulo operation, until a single number is derived.
 *
 * @param {number[]} initialDigits - An array of numeric digits.
 * @returns {number} The final single-digit result after all reduction steps.
 */
function condenseDigitSequence(initialDigits) {
    // Handle edge cases where the input sequence might be invalid or too short.
    if (!Array.isArray(initialDigits) || initialDigits.length === 0) {
        // For an empty sequence, the result is implicitly zero in this context.
        return 0;
    }
    if (initialDigits.length === 1) {
        // If there's only one digit, no reduction is needed; return it directly.
        return initialDigits[0];
    }

    // Create a mutable copy of the input array for processing.
    let activeSequence = [...initialDigits];
    let currentArraySize = activeSequence.length;

    // Continue iterating and reducing the sequence until only one element remains.
    while (currentArraySize > 1) {
        const nextIterationValues = []; // Temporary array to store results of the current reduction pass.

        // Loop through the active sequence, summing adjacent elements.
        for (let elementCursor = 0; elementCursor < currentArraySize - 1; ++elementCursor) {
            const firstOperand = activeSequence[elementCursor];
            const secondOperand = activeSequence[elementCursor + 1];

            // Compute the sum of the current pair of digits.
            const pairSum = firstOperand + secondOperand;

            // Store the result after applying the modulo operation.
            nextIterationValues.push(pairSum % SUM_MODULO_BASE);
        }

        // Replace the active sequence with the newly computed shorter sequence.
        activeSequence = nextIterationValues;
        currentArraySize = activeSequence.length;
    }

    // The loop guarantees that `activeSequence` will contain exactly one element.
    return activeSequence[0];
}

// --- Primary Program Execution Flow ---

try {
    // Synchronously read all content from the standard input stream.
    // Specifying 'utf8' ensures correct interpretation of multi-byte characters.
    const rawFileContents = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Split the entire content into individual lines.
    // Filter out any lines that are empty or contain only whitespace, ensuring meaningful data.
    const processedInputRows = rawFileContents.split('\n').filter(entry => entry.trim().length > 0);

    // Check if any valid input lines were found after filtering.
    if (processedInputRows.length === 0) {
        // If no lines to process, output a message and terminate gracefully.
        console.error("No valid input lines detected. Program terminating.");
        // The original code would simply exit without output if no lines.
    } else {
        // Iterate over each cleaned input line for processing.
        for (const currentInputString of processedInputRows) {
            // Convert the string of digits into an array of numbers.
            // Array.from(string, Number) is a concise way to achieve this.
            const parsedNumericArray = Array.from(currentInputString, Number);

            // Perform validation to ensure all characters were successfully converted to numbers.
            // If any character was not a digit, Number() results in NaN.
            const containsNonDigit = parsedNumericArray.some(value => isNaN(value));

            if (containsNonDigit) {
                console.error(`Error: Input "${currentInputString}" contains non-numeric data. Skipping this line.`);
                continue; // Move to the next line of input.
            }

            // Execute the core logic to condense the sequence.
            const finalCondensedValue = condenseDigitSequence(parsedNumericArray);

            // Output the single resulting digit for the current input line.
            console.log(finalCondensedValue);
        }
    }

} catch (ioError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An I/O error occurred: ${ioError.message}`);
    // Indicate an abnormal termination with a non-zero exit code.
    process.exit(1);
}