// Function to process game-related data from a raw input string.
function ProcessInputData(rawData) {
    // Ensure the input is a string and handle potential empty or invalid input.
    if (typeof rawData !== 'string' || rawData.length === 0) {
        console.error("Input data is invalid or empty. Cannot proceed.");
        return; // Exit if input is not suitable
    }

    // Remove any leading or trailing whitespace from the entire input block.
    const sanitizedInputText = rawData.trim();

    // Split the cleaned input into an array of individual lines.
    const inputLineSegments = sanitizedInputText.split("\n");

    // A utility function to convert an array of string numbers into an array of integers.
    // It also filters out any non-numeric values that might arise from parsing.
    const convertToNumericArray = (strArray) => {
        return strArray.map(item => Number(item)).filter(num => !isNaN(num));
    };

    // Extract and parse the game's configuration parameters from the first line.
    // This typically includes values like the sequence length and the cancellation window size.
    // Example: [totalSequenceLength, cancellationWindow]
    const gameConfigParameters = convertToNumericArray(inputLineSegments[0].split(" "));

    // Extract and parse the point values associated with different game moves from the second line.
    // Example: [pointsForScissors, pointsForPaper, pointsForRock]
    const moveAssociatedPoints = convertToNumericArray(inputLineSegments[1].split(" "));

    // Extract the sequence of player moves from the third line.
    // Ensure it's treated as a string, and then break it down into an array of individual characters.
    // Provide a default empty string if the line is missing to prevent errors.
    const playerMoveSequenceString = inputLineSegments[2] || '';
    const individualPlayerMoves = Array.from(playerMoveSequenceString);

    // Define a lookup map for assigning points based on the move character.
    // This makes the mapping explicit and easy to update.
    const pointAssignmentMap = {
        's': moveAssociatedPoints[0], // Points for 'scissors'
        'p': moveAssociatedPoints[1], // Points for 'paper'
        'r': moveAssociatedPoints[2]  // Points for 'rock'
    };

    // Calculate the initial, provisional points for each move in the sequence.
    // If a move character is not recognized, it defaults to 0 points.
    const preliminaryScoreList = individualPlayerMoves.map(currentMoveChar => {
        // Retrieve points from the map; if undefined, assign 0.
        return pointAssignmentMap[currentMoveChar] !== undefined ? pointAssignmentMap[currentMoveChar] : 0;
    });

    // Determine the offset for applying the cancellation rule from the game configuration.
    const cancellationOffsetValue = gameConfigParameters[1];

    // Create a new, mutable array to store the scores after applying the cancellation logic.
    // This ensures the original `preliminaryScoreList` remains untouched.
    const modifiedScoreResults = [...preliminaryScoreList];

    // Iterate through the scores to apply the specific cancellation rule.
    // If a score at the current index matches a score at `currentIdx + cancellationOffsetValue`,
    // the score at the future position (`currentIdx + cancellationOffsetValue`) is nullified (set to 0).
    for (let currentIdx = 0; currentIdx < modifiedScoreResults.length; currentIdx++) {
        const potentialCancellationIdx = currentIdx + cancellationOffsetValue;

        // Check if the potential cancellation index is within the valid bounds of the array.
        if (potentialCancellationIdx < modifiedScoreResults.length) {
            const scoreAtCurrentPosition = modifiedScoreResults[currentIdx];
            const scoreAtFuturePosition = modifiedScoreResults[potentialCancellationIdx];

            // If the scores are identical, the future score is cancelled out.
            if (scoreAtCurrentPosition === scoreAtFuturePosition) {
                modifiedScoreResults[potentialCancellationIdx] = 0;
            }
        }
    }

    // Sum up all the remaining points in the modified score array to get the final tally.
    const finalCalculatedScore = modifiedScoreResults.reduce((cumulativeSum, pointEntry) => {
        // Add the current point value to the sum, ensuring it's treated as a number.
        return cumulativeSum + (typeof pointEntry === 'number' ? pointEntry : 0);
    }, 0); // Start the cumulative sum from zero.

    // Output the final computed score to the console.
    console.log(finalCalculatedScore);
}

// This block handles the execution environment. It reads input from standard input
// and passes it to the main processing function.
try {
    const fileSystemModule = require("fs");
    const stdInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    ProcessInputData(stdInputContent);
} catch (executionError) {
    // Log any errors that occur during file reading or data processing.
    console.error("An error occurred during program execution:", executionError.message);
    // Optionally, provide a default output or error code.
    // process.exit(1);
}