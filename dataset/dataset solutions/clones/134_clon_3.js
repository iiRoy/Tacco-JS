// Expert-generated Type III Clone of Ball Sorting Logic

// Core module for file system operations.
const fileSystemHandler = require("fs");

// Standard input stream path for POSIX-like systems.
const standardInputSource = "/dev/stdin";

/**
 * Determines if a given sequence of integer values can be placed onto two
 * independent "stacks" such that each stack maintains strictly increasing order.
 * This function prioritizes placing a value onto the stack whose current top
 * is numerically smaller, or stack A if both are equally viable.
 *
 * @param {string} lineOfValues - A string where integer values are separated by whitespace.
 * @returns {string} "YES" if the entire sequence can be successfully placed, "NO" otherwise.
 */
function processValueSequence(lineOfValues) {
    // Sanitize and parse the input string into an array of numbers.
    const stringValues = lineOfValues.trim().split(/\s+/);
    if (stringValues.length === 0 || (stringValues.length === 1 && stringValues[0] === '')) {
        // An empty input line is considered a valid (trivially sorted) sequence.
        return "YES";
    }
    const numericalSequence = stringValues.map(Number);

    // Initialize the current maximum values (tops) for the two stacks.
    // A value of 0 implies any positive number can be placed first.
    let stackATopValue = 0;
    let stackBTopValue = 0;

    // A flag to track the feasibility of placing all numbers in the sequence.
    let sequenceIsFeasible = true;

    // Iterate through each number in the provided sequence.
    for (const currentNumber of numericalSequence) {
        // Calculate the difference between the current number and the top of each stack.
        // A positive difference indicates the current number can be placed on that stack.
        const differenceToA = currentNumber - stackATopValue;
        const differenceToB = currentNumber - stackBTopValue;

        // Determine if the current number can legally be placed on Stack A.
        const canFitInStackA = differenceToA > 0;
        // Determine if the current number can legally be placed on Stack B.
        const canFitInStackB = differenceToB > 0;

        // If the current number cannot be placed on either stack (it's too small for both),
        // then the sequence is not feasible.
        if (!canFitInStackA && !canFitInStackB) {
            sequenceIsFeasible = false;
            break; // No need to check further numbers for this problematic sequence.
        }

        // Decision logic for placing the current number:
        if (canFitInStackA && canFitInStackB) {
            // If it can fit in both stacks, choose the one that keeps its top value lower
            // (or Stack A if differences are equal) to maximize future placement options.
            if (differenceToA <= differenceToB) {
                stackATopValue = currentNumber;
            } else {
                stackBTopValue = currentNumber;
            }
        } else if (canFitInStackA) {
            // If it can only fit in Stack A.
            stackATopValue = currentNumber;
        } else if (canFitInStackB) {
            // If it can only fit in Stack B.
            stackBTopValue = currentNumber;
        }
        // No 'else' block here as the case where neither fits is handled above.
    }

    // Return the final verdict for the current sequence.
    return sequenceIsFeasible ? "YES" : "NO";
}

// --- Main Program Execution Flow ---
try {
    // Read the entire content from the standard input path.
    // Decode it as UTF-8, remove leading/trailing whitespace, and split into lines.
    // Supports both Windows (CRLF) and Unix (LF) line endings.
    const entireInputBuffer = fileSystemHandler.readFileSync(standardInputSource, "utf8");
    const allInputTextLines = entireInputBuffer.trim().split(/\r?\n/);

    // Implement a basic guard clause for absolutely no input.
    if (allInputTextLines.length === 0 || (allInputTextLines.length === 1 && allInputTextLines[0] === '')) {
        // In a competitive programming context, empty input might just mean no scenarios.
        process.exit(0); // Exit cleanly.
    }

    // The first line of input often contains metadata (like a case count)
    // which the original problem implicitly skips by starting its loop from index 1.
    // We replicate this behavior by slicing the array from the second element.
    const scenarioLinesForProcessing = allInputTextLines.slice(1);

    // Process each scenario line and output its result.
    for (const currentScenarioInput of scenarioLinesForProcessing) {
        const outcome = processValueSequence(currentScenarioInput);
        console.log(outcome);
    }

} catch (executionError) {
    // Catch and report any errors that occur during file I/O or processing.
    console.error(`An unexpected runtime error occurred: ${executionError.message}`);
    // Indicate an abnormal termination.
    process.exit(1);
}