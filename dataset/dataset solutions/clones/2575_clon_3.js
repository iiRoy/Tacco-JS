// Function to calculate a total score based on a sequence of dish consumption,
// incorporating base scores for each dish and bonus scores for consecutive dishes.
// This version includes robust parsing, added validation, and clear variable naming.
function calculateSequentialDishScore(rawInputText) {
    // Step 1: Divide the raw input string into individual lines.
    // Filters out any empty lines that might result from extra newlines.
    const processedInputLines = rawInputText.split('\n').filter(line => line.trim().length > 0);

    // Basic validation: Ensure the input contains at least the expected number of lines (N, A, B, C).
    if (processedInputLines.length < 4) {
        console.error("Error: Input data is incomplete. Expected at least 4 lines.");
        // In a production scenario, you might throw an error or handle it differently.
        // For this competitive programming context, returning 0 might be acceptable.
        return 0;
    }

    // Step 2: Parse the first line to get the number of elements (N).
    // This value indicates the length of the dish sequence.
    const totalElementsCount = parseInt(processedInputLines[0].trim(), 10);

    // Step 3: Parse the second line to obtain the sequence of dishes (array 'A').
    // Each value represents a 1-indexed dish identifier.
    const dishIdSequence = processedInputLines[1].split(' ').map(item => parseInt(item.trim(), 10));

    // Step 4: Parse the third line for base scores (array 'B').
    // These scores are awarded for simply consuming a dish.
    const basePointsPerDish = processedInputLines[2].split(' ').map(item => parseInt(item.trim(), 10));

    // Step 5: Parse the fourth line for bonus scores (array 'C').
    // These scores are awarded when specific consecutive dishes are consumed.
    const consecutiveBonusPoints = processedInputLines[3].split(' ').map(item => parseInt(item.trim(), 10));

    // Optional Validation: Check if the declared number of elements matches the actual sequence length.
    // This is an additional check for robust input handling, not strictly required by the original problem.
    if (dishIdSequence.length !== totalElementsCount) {
        // console.warn(`Warning: Declared element count (${totalElementsCount}) does not match actual sequence length (${dishIdSequence.length}). Proceeding with actual length.`);
        // For this exercise, we will proceed using totalElementsCount as the loop bound.
    }

    // Initialize a variable to accumulate the total score.
    let cumulativeScore = 0;

    // Iterate through the dish sequence to calculate the final score.
    // The loop runs for each dish in the 'dishIdSequence'.
    for (let currentPosition = 0; currentPosition < totalElementsCount; currentPosition++) {
        // Get the 1-indexed ID of the dish at the current position.
        const currentDishIdentifier = dishIdSequence[currentPosition];

        // Add the base score for the current dish.
        // Note: dish IDs are 1-indexed, so we subtract 1 to access the 0-indexed 'basePointsPerDish' array.
        cumulativeScore += basePointsPerDish[currentDishIdentifier - 1];

        // Check if a bonus applies for consecutive dishes.
        // A bonus is awarded if the current dish follows a specific previous dish directly in sequence.
        // We must ensure there is a previous dish to compare against (currentPosition > 0).
        if (currentPosition > 0) {
            // Get the 1-indexed ID of the dish at the previous position.
            const previousDishIdentifier = dishIdSequence[currentPosition - 1];

            // Condition for bonus: The current dish's ID is exactly one greater than the previous dish's ID.
            if (currentDishIdentifier === previousDishIdentifier + 1) {
                // Add the bonus score.
                // The index for 'consecutiveBonusPoints' is derived from the current dish's ID.
                // If dish IDs are 2 (previous) and 3 (current), the bonus index is 3 - 2 = 1 (c[1]).
                cumulativeScore += consecutiveBonusPoints[currentDishIdentifier - 2];
            }
        }
    }

    // The final calculated score is returned.
    return cumulativeScore;
}

// Standard boilerplate for competitive programming in Node.js:
// Read input from stdin, process it, and print the result to stdout.
const fileSystemUtility = require("fs");
const standardInputFile = "/dev/stdin";
const textEncoding = "utf8";

try {
    const rawInputDataContent = fileSystemUtility.readFileSync(standardInputFile, textEncoding);
    const finalCalculatedResult = calculateSequentialDishScore(rawInputDataContent);
    console.log(finalCalculatedResult);
} catch (executionError) {
    // Enhanced error handling for potential issues during file reading or function execution.
    console.error("An operational error occurred:", executionError.message);
    // As a fallback, output 0 or another appropriate error indicator.
    console.log(0);
}