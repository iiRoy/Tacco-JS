/**
 * This JavaScript module implements a character game logic.
 * It processes an initial string by iteratively removing characters
 * based on a specific rule, determining a winner at the end.
 */
const processStringGame = (initialSequence) => {
    // Convert the incoming string into a mutable array of individual characters.
    // This allows for in-place modifications, similar to Java's StringBuffer.
    let mutableCharList = initialSequence.split('');

    // A boolean variable to keep track of whose turn it currently is.
    // 'true' can represent the second player, and 'false' the first player.
    let currentParticipant = true;

    // The primary game loop. It continues to execute until a specific
    // condition within the loop causes it to terminate.
    while (true) {
        // Obtain the current number of elements present in our character array.
        const sequenceSize = mutableCharList.length;
        // A flag to indicate whether any character was successfully removed
        // during the current full pass (iteration) of the inner loop.
        let itemRemovedThisIteration = false;

        // Iterate through the character list. The loop starts from the second
        // character (index 1) and goes up to, but not including, the last character
        // (index `sequenceSize - 1`). This ensures we always have valid neighbors.
        for (let idx = 1; idx < sequenceSize - 1; idx++) {
            // Check if the character immediately preceding the current one
            // is different from the character immediately succeeding it.
            if (mutableCharList[idx - 1] !== mutableCharList[idx + 1]) {
                // If the neighbors are indeed different, remove the character
                // at the current index 'idx' from the array.
                mutableCharList.splice(idx, 1);
                // Toggle the 'currentParticipant' flag to switch turns between players.
                currentParticipant = !currentParticipant;
                // Set the flag to true, confirming that a character was removed.
                itemRemovedThisIteration = true;
                // Exit this inner 'for' loop immediately, as a valid move has been made.
                break;
            }
        }

        // After the inner loop completes, check if any character was removed.
        // If no character was removed during this entire round, it means no
        // more valid moves can be made, and the game concludes.
        if (!itemRemovedThisIteration) {
            break;
        }
    }

    // Once the game loop has terminated, determine the winner based on the
    // final state of the 'currentParticipant' flag.
    if (currentParticipant) {
        // If 'currentParticipant' is true, the second player is declared the winner.
        console.log("Second");
    } else {
        // Otherwise, if 'currentParticipant' is false, the first player wins.
        console.log("First");
    }
};

// To mimic the behavior of reading a single string input from standard input
// (like Java's `Scanner.next()`), this script expects a command-line argument
// when executed in a Node.js environment.
// `process.argv[2]` retrieves the first argument after the script name.
// A default empty string is provided if no argument is supplied, to prevent errors.
const inputArgument = process.argv[2] || "";
// Execute the game logic with the obtained input string.
processStringGame(inputArgument);
