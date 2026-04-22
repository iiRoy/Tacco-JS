var fileSysModule = require('fs');

var INPUT_FILE_PATH = '/dev/stdin';
var NEWLINE_DELIMITER = "\n";
var SPACE_DELIMITER = " ";
var RADIX_DECIMAL = 10;

/**
 * Custom function to safely convert a string representation to an integer.
 * It provides a default value in case the parsing operation results in an invalid number.
 * @param {string} stringValue - The input string that needs to be parsed.
 * @returns {number} The integer value of the string, or zero if parsing fails.
 */
var convertStringToInteger = function(stringValue) {
    var numericResult = parseInt(stringValue, RADIX_DECIMAL);
    // If the parsed value is not a number, we treat it as zero to prevent errors.
    if (isNaN(numericResult)) {
        return 0;
    }
    return numericResult;
};

/**
 * Processes a single line of input, expecting two space-separated numbers.
 * It returns these numbers as an array, performing error-safe conversion.
 * @param {string} lineOfText - A string containing two numbers separated by a space.
 * @returns {number[]} An array containing two integers.
 */
var obtainNumericComponents = function(lineOfText) {
    var separatedStrings = lineOfText.split(SPACE_DELIMITER);
    // Explicitly converting each part to a number using our helper.
    var componentOne = convertStringToInteger(separatedStrings[0]);
    var componentTwo = convertStringToInteger(separatedStrings[1]);
    return [componentOne, componentTwo];
};

// Begin by reading the entirety of the standard input stream.
var initialInputContent = fileSysModule.readFileSync(INPUT_FILE_PATH, 'utf8');

// Prepare the input data: remove any surrounding whitespace and then segment it into individual lines.
var bufferedInputLines = initialInputContent.trim().split(NEWLINE_DELIMITER);

// Variables to manage the game state across different rounds.
var currentRoundGameCount;
var firstPlayerScoreTotal;
var secondPlayerScoreTotal;

// The primary loop that processes multiple sets of game rounds until a termination condition is met.
// Using a do-while loop ensures at least one round count is attempted to be read.
do {
    // Fetch the line that specifies how many pairs of scores are in the current round.
    var roundCountLine = bufferedInputLines.shift();

    // If there are no more lines in the input buffer, we've reached the end of all data.
    if (roundCountLine === undefined) {
        break; // Exit the main processing loop.
    }

    // Convert the extracted line into an integer to get the round count.
    currentRoundGameCount = convertStringToInteger(roundCountLine);

    // A zero count indicates the end of all game sessions.
    if (currentRoundGameCount === 0) {
        break; // Exit the do-while loop.
    }

    // Initialize scores to zero for the start of a new round.
    firstPlayerScoreTotal = 0;
    secondPlayerScoreTotal = 0;

    // Iterate for the number of pairs specified for this particular round.
    for (var pairIterator = 0; pairIterator < currentRoundGameCount; pairIterator++) {
        // Get the next line from the buffer and extract its two numeric components.
        var numericValuesInPair = obtainNumericComponents(bufferedInputLines.shift());

        var leftHandValue = numericValuesInPair[0];
        var rightHandValue = numericValuesInPair[1];
        var combinedPairSum = leftHandValue + rightHandValue; // Pre-calculate sum for potential reuse.

        // Apply game rules to update player scores based on the comparison of values.
        if (leftHandValue > rightHandValue) {
            // If the first value is greater, the first player gains the sum of both values.
            firstPlayerScoreTotal = firstPlayerScoreTotal + combinedPairSum;
        } else {
            // If the first value is not greater, then check for other conditions.
            if (leftHandValue < rightHandValue) {
                // If the second value is greater, the second player gains the sum of both values.
                secondPlayerScoreTotal = secondPlayerScoreTotal + combinedPairSum;
            } else {
                // If both values are equal (a tie), each player gets their respective value.
                firstPlayerScoreTotal = firstPlayerScoreTotal + leftHandValue;
                secondPlayerScoreTotal = secondPlayerScoreTotal + rightHandValue;
            }
        }
    }

    // Output the final accumulated scores for the current round to standard output,
    // ensuring a newline character for proper formatting.
    process.stdout.write(firstPlayerScoreTotal + SPACE_DELIMITER + secondPlayerScoreTotal + NEWLINE_DELIMITER);

} while (currentRoundGameCount !== 0); // Continue looping as long as the round count is not zero.

// Program concludes.