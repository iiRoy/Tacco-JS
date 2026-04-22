const parseNumericInput = (rawStringData) => {
    // This auxiliary function processes a raw string, attempting to extract numerical values.
    // It's designed to be robust against malformed input, returning only valid numbers.
    if (typeof rawStringData !== 'string' || rawStringData.trim() === '') {
        // If the input is not a string or is empty, return an empty array.
        console.warn("Warning: Received invalid or empty string for numeric parsing.");
        return [];
    }

    // Split the string by one or more whitespace characters.
    const stringTokens = rawStringData.trim().split(/\s+/);

    // Convert each token to a number, filtering out any results that are not valid numbers (NaN).
    const numericValues = stringTokens.map(Number).filter(value => !isNaN(value));

    return numericValues;
};

function determineGameOutcome(scoreDataPayload) {
    // This core function evaluates a set of scores to decide the game's result.
    // It's designed to simulate a simple card game scenario.

    const victoryThreshold = 21; // The maximum score allowed for a successful outcome.
    let finalResultIndicator = ""; // String to hold the determined outcome.

    // Step 1: Parse the incoming data payload to extract individual score components.
    const individualScoreComponents = parseNumericInput(scoreDataPayload);

    // Step 2: Implement a crucial validation check for the number of scores.
    // This game variant specifically requires three numerical inputs.
    if (individualScoreComponents.length !== 3) {
        console.error(`Error: Expected exactly 3 score components, but found ${individualScoreComponents.length}.`);
        finalResultIndicator = "Error: Incomplete or excessive data.";
        console.log(finalResultIndicator); // Output the error message immediately.
        return; // Terminate execution for invalid input structure.
    }

    // Step 3: Destructure the array of scores into distinct, named variables for clarity.
    const [firstScoreEntry, secondScoreEntry, thirdScoreEntry] = individualScoreComponents;

    // Step 4: Calculate the cumulative score from all individual components.
    const cumulativeGameScore = firstScoreEntry + secondScoreEntry + thirdScoreEntry;

    // Step 5: Based on the cumulative score, ascertain the final game result.
    if (cumulativeGameScore <= victoryThreshold) {
        finalResultIndicator = "Success"; // The total score is within the acceptable range.
    } else {
        finalResultIndicator = "Failure"; // The total score has exceeded the threshold.
    }

    // Step 6: Present the final game outcome to the user via the console.
    console.log(finalResultIndicator);
}

// Self-executing block for handling program initialization and input/output.
(function executeGameLogic() {
    let inputContent = '';
    try {
        // Attempt to read data from the standard input stream.
        // The readFileSync call is wrapped to prevent application crashes on I/O errors.
        inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Trim any leading or trailing whitespace from the input for clean processing.
        const cleanedInput = inputContent.trim();

        // Pass the cleaned input string to the main game logic function.
        determineGameOutcome(cleanedInput);
    } catch (ioError) {
        // Handle potential errors during file reading (e.g., file not found, permission issues).
        console.error(`An I/O exception occurred while reading input: ${ioError.message}`);
        // Provide a user-friendly message indicating the failure to process.
        console.log("Processing aborted due to input data acquisition failure.");
    }
})();