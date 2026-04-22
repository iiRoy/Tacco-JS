const fileSystemModule = require('fs');

// Define the standard path for input, commonly used in Unix-like environments.
const standardInputPath = '/dev/stdin';

// Read all raw data from the specified input file path.
// The data is decoded as UTF-8 text.
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

// Process the raw input:
// 1. Remove any leading or trailing whitespace from the entire content.
// 2. Split the cleaned content into an array of individual lines based on newline characters.
const processedInputLines = rawInputContent.trim().split('\n');

// An array used to temporarily accumulate the summed scores for a block of contestants.
// This array is cleared once a complete block of scores has been processed.
let contestantScoreAccumulator = [];

// A constant array holding the labels for each contestant position (A, B, C, D, E).
// These labels are used to identify the winner of a score block.
const competitorLabels = ['A', 'B', 'C', 'D', 'E'];

// Define the fixed number of scores that constitute a complete processing block.
const SCORE_BLOCK_SIZE = 5;

// Begin iterating through each line of the pre-processed input data.
for (let lineIndex = 0; lineIndex < processedInputLines.length; lineIndex++) {
    const currentInputLine = processedInputLines[lineIndex];

    // Implement a specific termination condition:
    // If the score accumulator is currently empty (meaning a new block is expected or just completed),
    // and the current line, after trimming, is exactly "0 0", it acts as a global sentinel
    // to halt further processing of input lines.
    if (contestantScoreAccumulator.length === 0 && currentInputLine.trim() === "0 0") {
        // Exit the loop immediately, effectively ending the program's input processing phase.
        break;
    }

    // Skip any lines that are empty or contain only whitespace to prevent errors during parsing.
    if (!currentInputLine || currentInputLine.trim() === "") {
        // Move to the next line without processing the current one.
        continue;
    }

    // Split the current line into potential numeric components using a space as the delimiter.
    const numberComponents = currentInputLine.split(' ');

    // Validate the structure of the input line: it must contain exactly two components.
    if (numberComponents.length !== 2) {
        // Log an error message to the console for diagnostic purposes.
        console.error(`[Input Error] Line ${lineIndex + 1}: Expected two numbers, but found '${numberComponents.length}' components. Skipping line: '${currentInputLine}'`);
        // Proceed to the next input line.
        continue;
    }

    // Attempt to parse the two components into base-10 integers.
    const firstNumericalValue = parseInt(numberComponents[0], 10);
    const secondNumericalValue = parseInt(numberComponents[1], 10);

    // Validate that both parsed values are indeed valid numbers (not NaN).
    if (isNaN(firstNumericalValue) || isNaN(secondNumericalValue)) {
        // Log an error if any component could not be converted into a valid number.
        console.error(`[Data Error] Line ${lineIndex + 1}: Non-numeric values detected. Skipping line: '${currentInputLine}'`);
        // Skip this line and move to the next.
        continue;
    }

    // Calculate the sum of the two validated numerical values.
    const calculatedSumOfValues = firstNumericalValue + secondNumericalValue;

    // Add this sum to our temporary accumulator for the current block of scores.
    contestantScoreAccumulator.push(calculatedSumOfValues);

    // After adding a score, check if the accumulator has reached the predefined block size.
    if (contestantScoreAccumulator.length === SCORE_BLOCK_SIZE) {
        // If a full block of scores has been collected, determine the winner.

        // Initialize variables to keep track of the highest score found in this block
        // and the index of the competitor who achieved it.
        let highestScoreInCurrentBlock = -Infinity; // Set to negative infinity to ensure any score is higher.
        let winningCompetitorIndex = -1; // -1 indicates no winner found yet.

        // Iterate through the scores in the current block to find the maximum score and its position.
        for (let j = 0; j < contestantScoreAccumulator.length; j++) {
            if (contestantScoreAccumulator[j] > highestScoreInCurrentBlock) {
                highestScoreInCurrentBlock = contestantScoreAccumulator[j];
                winningCompetitorIndex = j; // Update the index of the highest score.
            }
        }

        // Retrieve the label of the winning competitor using the identified index.
        // Provide a fallback 'UNKNOWN' label if for some unexpected reason an invalid index was recorded.
        const identifiedWinningCompetitor = (winningCompetitorIndex !== -1)
            ? competitorLabels[winningCompetitorIndex]
            : 'UNKNOWN';

        // Output the result for the completed block: the winner's label and their highest score.
        console.log(`${identifiedWinningCompetitor} ${highestScoreInCurrentBlock}`);

        // Reset the score accumulator to an empty array, preparing it for the next block of scores.
        contestantScoreAccumulator = [];
    }
}

// End of input processing. No further action is taken if the loop completes,
// even if `contestantScoreAccumulator` contains an incomplete block,
// aligning with the original code's implicit behavior.