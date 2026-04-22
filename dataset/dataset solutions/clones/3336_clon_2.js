'use strict';

// This function calculates the optimal score difference for a game played on a sequence of numbers.
// It uses dynamic programming to determine the maximum score a player can achieve.
function processSequenceData(itemCount, sourceValues) {
    // Initialize a 2D array (memoization table) to store the maximum scores achievable
    // for various sub-sequences. The table is 1-indexed for convenience,
    // hence dimensions are (itemCount + 1) by (itemCount + 1).
    const memoizedScores = Array.from({
        length: itemCount + 1
    }, () => new Array(itemCount + 1).fill(0));

    let initialStartBoundary = 1; // Represents the fixed starting index for sub-sequences (always 1 in this setup).
    let sequenceLengthTracker = 1; // Tracks the current length of sub-sequences being evaluated.

    // The outer loop iterates through possible lengths of sub-sequences, from 1 up to 'itemCount'.
    while (sequenceLengthTracker <= itemCount) {
        let currentEndingIndex = sequenceLengthTracker; // The actual ending index 'j' for dp[i][j].

        // The inner loop iterates through all possible starting positions 'i' for a sub-sequence
        // of the current 'sequenceLengthTracker'.
        for (let currentStartingIndex = initialStartBoundary; currentStartingIndex <= itemCount; currentStartingIndex++) {
            // If the current ending index goes beyond the total number of items,
            // it means no more valid sub-sequences can be formed starting from 'currentStartingIndex'
            // with the current 'sequenceLengthTracker'.
            if (currentEndingIndex > itemCount) {
                break; // Exit the inner loop.
            }

            // Base case 1: If the sub-sequence contains only one element (length = 1).
            // The player simply takes that single element.
            if (currentEndingIndex === currentStartingIndex) {
                memoizedScores[currentStartingIndex][currentEndingIndex] = sourceValues[currentStartingIndex - 1];
            }
            // Base case 2: If the sub-sequence contains exactly two elements (length = 2).
            // The player takes the larger of the two available elements.
            else if (currentEndingIndex === (currentStartingIndex + 1)) {
                memoizedScores[currentStartingIndex][currentEndingIndex] = Math.max(
                    sourceValues[currentStartingIndex - 1], // Value of the first element in the current sub-sequence
                    sourceValues[currentEndingIndex - 1] // Value of the second element in the current sub-sequence
                );
            }
            // General case: If the sub-sequence contains more than two elements.
            // This is where the game strategy comes into play. The current player chooses an end element.
            // The opponent then chooses an end element from the *remaining* sequence.
            // The current player's total score for this turn is their chosen element's value
            // plus the score they will ultimately get from the sub-sequence that remains *after the opponent's optimal move*.
            else {
                // Scenario A: Current player picks the element at `sourceValues[currentStartingIndex - 1]` (the leftmost element).
                // After this, the opponent plays on the sub-sequence from `sourceValues[currentStartingIndex]` to `sourceValues[currentEndingIndex - 1]`.
                // The opponent will pick an element to *minimize* the current player's final score.
                // The opponent can pick `sourceValues[currentStartingIndex]` (leaving `sourceValues[currentStartingIndex + 1]` to `sourceValues[currentEndingIndex - 1]`,
                // for which current player's score is `memoizedScores[currentStartingIndex + 2][currentEndingIndex]`).
                // OR the opponent can pick `sourceValues[currentEndingIndex - 1]` (leaving `sourceValues[currentStartingIndex]` to `sourceValues[currentEndingIndex - 2]`,
                // for which current player's score is `memoizedScores[currentStartingIndex + 1][currentEndingIndex - 1]`).
                const scoreIfLeftElementTaken = sourceValues[currentStartingIndex - 1] + Math.min(
                    memoizedScores[currentStartingIndex + 2][currentEndingIndex], // Opponent takes left, current player gets from (i+2, j)
                    memoizedScores[currentStartingIndex + 1][currentEndingIndex - 1] // Opponent takes right, current player gets from (i+1, j-1)
                );

                // Scenario B: Current player picks the element at `sourceValues[currentEndingIndex - 1]` (the rightmost element).
                // After this, the opponent plays on the sub-sequence from `sourceValues[currentStartingIndex]` to `sourceValues[currentEndingIndex - 2]`.
                // Similar to Scenario A, the opponent will pick to minimize the current player's score.
                // The opponent can pick `sourceValues[currentStartingIndex]` (leaving `sourceValues[currentStartingIndex + 1]` to `sourceValues[currentEndingIndex - 2]`,
                // for which current player's score is `memoizedScores[currentStartingIndex + 1][currentEndingIndex - 1]`).
                // OR the opponent can pick `sourceValues[currentEndingIndex - 2]` (leaving `sourceValues[currentStartingIndex]` to `sourceValues[currentEndingIndex - 3]`,
                // for which current player's score is `memoizedScores[currentStartingIndex][currentEndingIndex - 2]`).
                const scoreIfRightElementTaken = sourceValues[currentEndingIndex - 1] + Math.min(
                    memoizedScores[currentStartingIndex + 1][currentEndingIndex - 1], // Opponent takes left, current player gets from (i+1, j-1)
                    memoizedScores[currentStartingIndex][currentEndingIndex - 2] // Opponent takes right, current player gets from (i, j-2)
                );

                // The current player chooses the option (taking left or right element) that maximizes their own score.
                memoizedScores[currentStartingIndex][currentEndingIndex] = Math.max(scoreIfLeftElementTaken, scoreIfRightElementTaken);
            }
            currentEndingIndex++; // Move to consider the next sub-sequence with an incremented ending index.
        }
        sequenceLengthTracker++; // Increment the length of sub-sequences for the next iteration of the outer loop.
    }

    // After filling the entire DP table, `memoizedScores[1][itemCount]` holds the total score
    // obtained by the first player (Taro in typical problems) when playing optimally on the full sequence.
    const playerOneFinalScore = memoizedScores[1][itemCount];

    // Calculate the grand total of all numbers in the original sequence.
    const totalCollectionSum = sourceValues.reduce((runningTotal, currentElement) => runningTotal + currentElement, 0);

    // The second player's score is simply the total sum minus the first player's score.
    // The problem requires the difference between the first player's score and the second player's score.
    // This is: (First Player's Score) - (Second Player's Score)
    // Which simplifies to: playerOneFinalScore - (totalCollectionSum - playerOneFinalScore)
    // Or equivalently: (2 * playerOneFinalScore) - totalCollectionSum.
    return playerOneFinalScore - (totalCollectionSum - playerOneFinalScore);
}

// This is the main entry point of the program. It handles input parsing and output.
function executeProcessing(rawInputText) {
    // Split the entire input string into an array of individual lines.
    const inputContentRows = rawInputText.split("\n");

    // Parse the first line to extract the count of items (N).
    const itemCount = parseInt(inputContentRows[0], 10);

    // Parse the second line to get the array of numerical values (A).
    // It splits the string by spaces and converts each resulting string segment to an integer.
    const sourceValues = inputContentRows[1].split(' ').map(segmentString => parseInt(segmentString, 10));

    // Call the core logic function to compute the desired outcome.
    const calculatedOutcome = processSequenceData(itemCount, sourceValues);

    // Display the final calculated result to the standard output.
    console.log(calculatedOutcome);
}

// Invoke the main processing function, reading input from '/dev/stdin' (standard input).
executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));