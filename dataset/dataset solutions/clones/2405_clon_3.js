// This program calculates a total score based on two input categories.
// It processes a single line of input containing two numeric identifiers.

const TOP_RANK_POINTS = 30000;  // Points awarded for a top-tier rank (identifier 1)
const MID_RANK_POINTS = 20000;  // Points awarded for a mid-tier rank (identifier 2)
const LOW_RANK_POINTS = 10000;  // Points awarded for a low-tier rank (identifier 3)
const SPECIAL_BONUS_AWARD = 40000; // Extra points for a specific combination of top-tier ranks

/**
 * Helper function to determine the score for a single rank identifier.
 * This function encapsulates the logic for assigning points based on a given rank value.
 * @param {number} rankIdentifier The numeric identifier for a category rank.
 * @returns {number} The points corresponding to the rank, or 0 if the rank is not recognized.
 */
function determineRankScore(rankIdentifier) {
    let scoreForRank = 0; // Initialize score for clarity and safety

    switch (rankIdentifier) {
        case 1:
            scoreForRank = TOP_RANK_POINTS;
            break;
        case 2:
            scoreForRank = MID_RANK_POINTS;
            break;
        case 3:
            scoreForRank = LOW_RANK_POINTS;
            break;
        default:
            // For any other identifier, no points are awarded.
            // This acts as a guard for unexpected or out-of-range input values.
            scoreForRank = 0;
            break;
    }

    return scoreForRank;
}

/**
 * Main function to execute the program logic.
 * It takes raw string input, performs parsing and validation,
 * calculates a cumulative score based on defined rules, and prints the final result.
 * @param {string} inputContentString The raw string content read from the input source.
 */
const executeProgramLogic = (inputContentString) => {
    // Step 1: Pre-process the input string.
    // Trim leading/trailing whitespace and split into individual lines.
    // We specifically expect our data to reside on the first line.
    const processedLines = inputContentString.trim().split('\n');

    // Step 2: Input validation - Check if any lines of data were provided.
    if (processedLines.length === 0) {
        console.error("Error: No input data provided. The input string was empty or contained only whitespace.");
        return; // Terminate execution if no valid input lines are found.
    }

    // Step 3: Extract and tokenize the primary data line.
    // The first line should contain our two numeric values, separated by a space.
    const dataTokens = processedLines[0].split(' ');

    // Step 4: Input validation - Ensure the expected number of tokens are present.
    if (dataTokens.length !== 2) {
        console.error("Error: Expected two numeric values on the first line of input, but found " + dataTokens.length + " tokens.");
        return; // Terminate execution if the format is incorrect.
    }

    // Step 5: Parse the extracted tokens into numeric values.
    // Using the Number() constructor for explicit type conversion.
    const primaryCategoryValue = Number(dataTokens[0]);
    const secondaryCategoryValue = Number(dataTokens[1]);

    // Step 6: Input validation - Check if the parsed values are indeed valid numbers.
    if (isNaN(primaryCategoryValue) || isNaN(secondaryCategoryValue)) {
        console.error("Error: One or both of the input values are not valid numbers. Received: '" + dataTokens[0] + "', '" + dataTokens[1] + "'.");
        return; // Terminate if non-numeric input is detected.
    }

    // Step 7: Initialize the accumulator for the total score.
    let runningTotalPoints = 0;

    // Step 8: Calculate points for the primary category using the dedicated helper function.
    runningTotalPoints += determineRankScore(primaryCategoryValue);

    // Step 9: Calculate points for the secondary category, similarly.
    runningTotalPoints += determineRankScore(secondaryCategoryValue);

    // Step 10: Evaluate the special bonus condition.
    // This condition applies if BOTH categories are of the top rank (identifier 1).
    const isBothCategoriesTopRank = (primaryCategoryValue === 1 && secondaryCategoryValue === 1);

    // Step 11: Apply the special bonus if the condition is met.
    if (isBothCategoriesTopRank) {
        runningTotalPoints += SPECIAL_BONUS_AWARD;
    }
    
    // Step 12: Output the final calculated total points to the console.
    console.log(runningTotalPoints);
};

// Application entry point:
// Reads the entire content from a specified input source (defaulting to /dev/stdin for POSIX systems).
// The input path can be dynamically configured via an environment variable 'INPUT_PATH' for enhanced flexibility,
// particularly useful in diverse execution environments or for testing purposes.
// The 'node:fs' module is explicitly used to signify it's a Node.js-specific file system operation.
executeProgramLogic(require('node:fs').readFileSync(process.env.INPUT_PATH || '/dev/stdin', { encoding: 'utf8' }));