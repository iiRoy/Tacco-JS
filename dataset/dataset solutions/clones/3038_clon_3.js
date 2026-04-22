"use strict";

// A helper function to parse the initial input string into structured data.
// This function handles validations and type conversions.
function processInputData(rawTextInput) {
    // Remove any leading/trailing whitespace from the entire input, then split by newline.
    const inputLineSegments = rawTextInput.trim().split('\n');

    // --- Type III: Added input validation ---
    // Ensure there are at least two lines of input (N and the stone sequence).
    if (inputLineSegments.length < 2) {
        console.error("Input parsing error: Not enough lines provided. Expected at least two lines.");
        // Return default/empty values to allow the main logic to handle this gracefully.
        return { elementCount: 0, elements: [] };
    }

    // --- Type II: Renamed variables and used Number() instead of parseInt() ---
    // Parse the first line as the total count of elements.
    const declaredElementCount = Number(inputLineSegments[0]);

    // --- Type III: Added more robust validation for the count ---
    // Check if the parsed count is a valid, non-negative integer.
    if (isNaN(declaredElementCount) || declaredElementCount < 0 || !Number.isInteger(declaredElementCount)) {
        console.error(`Input parsing error: Invalid element count '${inputLineSegments[0]}' detected.`);
        return { elementCount: 0, elements: [] };
    }

    // --- Type II: Renamed variables ---
    // Split the second line into an array of individual character elements.
    const elementCharacterSequence = inputLineSegments[1].split('');

    // --- Type III: Added a consistency check ---
    // Verify if the declared count matches the actual length of the sequence.
    if (declaredElementCount !== elementCharacterSequence.length) {
        console.warn(`Input parsing warning: Declared element count (${declaredElementCount}) does not match actual sequence length (${elementCharacterSequence.length}). Proceeding with actual length.`);
        // For robustness, we might use the actual length if there's a mismatch.
        // Or, we could throw an error if strict adherence to declared N is required.
        // For this problem's common usage, we'll assume the problem setter's N is reliable.
        // But for Type III, demonstrating this check is good.
    }

    // Return an object containing the parsed data for clarity.
    return {
        elementCount: declaredElementCount, // Using the declared count as per problem spec
        elements: elementCharacterSequence
    };
}

// A dedicated function to perform the counting logic.
// This extracts the counting responsibility from the main flow.
function analyzeElementTypes(sequenceOfElements) {
    // --- Type II: Renamed counters ---
    let periodSymbolCounter = 0; // Represents '.' stones
    let hashSymbolCounter = 0;   // Represents '#' stones

    // --- Type III: Changed iteration method (for...of instead of traditional for loop) ---
    // Iterate over each character in the sequence.
    for (const individualElement of sequenceOfElements) {
        // --- Type III: Changed conditional structure (switch instead of if/else if) ---
        switch (individualElement) {
            case '.':
                periodSymbolCounter++;
                break;
            case '#':
                hashSymbolCounter++;
                break;
            default:
                // --- Type III: Added a default case for unknown elements ---
                console.warn(`Analysis warning: Encountered an unrecognized element '${individualElement}'. It will be ignored.`);
                break;
        }
    }

    // Return the collected counts in a structured object.
    return {
        totalPeriods: periodSymbolCounter,
        totalHashes: hashSymbolCounter
    };
}

// The primary function orchestrating the entire process.
// --- Type II: Renamed function ---
function executeStoneAnalysis(rawProblemInput) {
    // --- Type II: Renamed variable ---
    // Parse the input string into a structured format using the helper.
    const { elementCount: totalItems, elements: stoneArrangement } = processInputData(rawProblemInput);

    // --- Type III: Added an early exit / guard clause ---
    // If input parsing failed or yielded no valid data, stop execution.
    if (totalItems === 0 || stoneArrangement.length === 0) {
        console.error("Execution halted due to invalid or empty input data.");
        return; // Exit the function.
    }

    // Analyze the types of elements present in the sequence.
    const typeCounts = analyzeElementTypes(stoneArrangement);

    // --- Type II: Renamed variables ---
    // Destructure the counts for clearer variable names in this context.
    const { totalPeriods: countOfDots, totalHashes: countOfOctothorpes } = typeCounts;

    // --- Type III: Used Math.min() instead of a ternary operator ---
    // Determine the minimum number of removals needed to make all stones uniform.
    const minimumRequiredRemovals = Math.min(countOfDots, countOfOctothorpes);

    // Output the final computed result.
    console.log(minimumRequiredRemovals);
}

// --- Type II: Renamed variable for file system module ---
const fileStreamModule = require('fs');
// --- Type II: Renamed variable for standard input path ---
const standardInputDevicePath = '/dev/stdin';

// --- Type III: Wrapped file reading in a try-catch block for error handling ---
try {
    // Read the content of the standard input file synchronously.
    const fileContentBuffer = fileStreamModule.readFileSync(standardInputDevicePath, 'utf8');
    // Pass the read content to the main analysis function.
    executeStoneAnalysis(fileContentBuffer);
} catch (ioError) {
    // --- Type III: Added error logging for file I/O operations ---
    console.error(`An error occurred while reading from standard input: ${ioError.message}`);
    // In a production environment, you might also want to exit with a non-zero status code.
    // process.exit(1);
}