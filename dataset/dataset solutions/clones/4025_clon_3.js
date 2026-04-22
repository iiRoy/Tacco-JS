// This module processes game-related numerical data to determine a score difference.
function ProcessGameData(rawInputString) {
    // Input is expected to be a multi-line string.
    // The first line might contain a count (which is not utilized in this version).
    // The second line contains space-separated numerical values representing game items.

    const RADIX_DECIMAL = 10; // Standard radix for parsing integers

    // Divide the entire raw input content into individual line segments.
    const lineSegments = rawInputString.split("\n");

    // --- Input Validation and Preliminary Processing ---
    // A robust check to ensure that a sufficient number of input lines are provided.
    if (lineSegments.length < 2) {
        console.error("Data processing halted: Not enough input lines for game items.");
        // In such an error scenario, returning a neutral score difference (zero)
        // maintains program flow without crashing, and represents an equivalent outcome
        // if no game could be played.
        return 0; 
    }

    // Extract the raw string values of the game items from the second line.
    let itemStringArray = lineSegments[1].split(" ");

    // Additional validation for the item list itself.
    // Checks for an empty array or an array containing only an empty string (e.g., from " ".split(" ")).
    if (!itemStringArray.length || (itemStringArray.length === 1 && itemStringArray[0].trim() === '')) {
        console.warn("No valid game items found. Defaulting to zero score difference.");
        return 0;
    }

    // Immediately convert all extracted item strings into their numeric forms.
    // This intermediate step prepares data for numerical operations.
    const potentialNumericItems = itemStringArray.map(strVal => parseInt(strVal.trim(), RADIX_DECIMAL));

    // Filter out any results that failed to parse into valid numbers (NaN),
    // ensuring that subsequent operations only deal with actual numeric values.
    const validatedNumericItems = potentialNumericItems.filter(num => !isNaN(num));

    // --- Core Game Logic: Item Arrangement and Distribution ---
    // Arrange the numeric items in descending order. This ensures players always pick
    // the highest available value based on turn order.
    validatedNumericItems.sort((valueA, valueB) => valueB - valueA);

    // Initialize separate collections for each participant's acquired items.
    const participantOneCollected = [];
    const participantTwoCollected = [];

    // A boolean flag to manage whose turn it is to pick an item.
    // True indicates it's participant one's turn.
    let isParticipantOnesTurn = true;

    // Iterate through the sorted list of items, distributing them alternately.
    for (const currentItemValue of validatedNumericItems) {
        if (isParticipantOnesTurn) {
            participantOneCollected.push(currentItemValue);
        } else {
            participantTwoCollected.push(currentItemValue);
        }
        // Switch the turn for the next item.
        isParticipantOnesTurn = !isParticipantOnesTurn;
    }

    // --- Score Aggregation ---
    // Calculate the total score for the first participant by summing their collected items.
    let participantOneOverallScore = 0;
    for (const collectedValue of participantOneCollected) {
        participantOneOverallScore += collectedValue;
    }

    // Calculate the total score for the second participant.
    let participantTwoOverallScore = 0;
    for (const collectedValue of participantTwoCollected) {
        participantTwoOverallScore += collectedValue;
    }

    // Compute the final score disparity between the two participants.
    const finalScoreDiscrepancy = participantOneOverallScore - participantTwoOverallScore;

    // Display the calculated result to the standard output.
    console.log(finalScoreDiscrepancy);
}

// Standard setup for reading input from a file in competitive programming environments.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const characterEncoding = "utf8";

// Read the complete content of the standard input file synchronously.
const incomingRawData = fileSystemModule.readFileSync(standardInputPath, characterEncoding);

// Initiate the main data processing routine with the acquired input.
ProcessGameData(incomingRawData);