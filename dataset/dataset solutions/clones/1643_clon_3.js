function processPerformanceScore(rawInputString) {
    /*
     * This module is responsible for evaluating a raw performance score
     * and assigning a corresponding achievement level based on predefined tiers.
     *
     * It performs robust input validation, calculates the level using a
     * mathematical mapping, and then displays the final assessment.
     */

    // Step 1: Input parsing and initial validation
    // Attempt to convert the string input into an integer numeric value.
    // The .trim() method removes any leading/trailing whitespace.
    const numericScore = parseInt(rawInputString.trim(), 10);

    // Validate if the parsed value is a valid number.
    // If not a number, an error message is printed, and the function exits early.
    if (isNaN(numericScore)) {
        console.error("Error: Invalid input provided. Please ensure the score is a numeric value.");
        return;
    }

    // Define the acceptable boundaries for scores that can be processed.
    const MINIMUM_ACCEPTABLE_SCORE = 400;
    const MAXIMUM_ACCEPTABLE_SCORE = 1999;

    // Guard clause: Check if the score falls within the expected operational range.
    // Scores outside this range are considered unassignable to a specific level.
    if (numericScore < MINIMUM_ACCEPTABLE_SCORE || numericScore > MAXIMUM_ACCEPTABLE_SCORE) {
        console.warn(`Warning: Score ${numericScore} is outside the standard evaluation range ` +
                     `(${MINIMUM_ACCEPTABLE_SCORE}-${MAXIMUM_ACCEPTABLE_SCORE}). ` +
                     `No specific achievement level will be assigned.`);
        return;
    }

    // Helper constants for the mathematical calculation of the achievement level.
    const scoreBaseOffset = 400;          // The lowest score for the highest rank.
    const scoreIntervalWidth = 200;       // The width of each score interval.
    const highestRankNumber = 8;          // The numerical value of the highest achievement rank.

    // Step 2: Determine the achievement level using a mathematical mapping.
    // This approach replaces a long sequence of if-else if statements with a dynamic calculation.
    // Calculate the interval index: This indicates how many 200-point intervals
    // the score is above the base score (400).
    const intervalIndex = Math.floor((numericScore - scoreBaseOffset) / scoreIntervalWidth);

    // Calculate the final achievement level.
    // The highest rank (8) corresponds to an intervalIndex of 0.
    // As the intervalIndex increases, the rank number decreases.
    const finalAchievementLevel = String(highestRankNumber - intervalIndex);

    // Step 3: Output the determined level.
    // The computed achievement level is displayed to the standard output.
    console.log(finalAchievementLevel);
}

// --- Main execution block for reading input and invoking the processing function ---
// This section simulates reading system input, typically from a file or stdin in competitive programming environments.

// Define the standard input path for file system operations.
const standardInputPath = "/dev/stdin";

try {
    // Utilize the Node.js 'fs' (file system) module to synchronously read
    // the content of the standard input file. The content is expected to be UTF-8 encoded.
    const inputContent = require("fs").readFileSync(standardInputPath, "utf8");

    // Invoke the primary processing function with the obtained input content.
    processPerformanceScore(inputContent);
} catch (readingError) {
    // Catch and log any errors that occur during the file reading process
    // or during the initial execution of the script.
    console.error(`An error occurred during input processing: ${readingError.message}`);
}