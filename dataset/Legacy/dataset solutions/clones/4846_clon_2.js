// This script processes input data to determine a game's outcome.
function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    var parsedLines = rawData.split('\n');
    var finalResult; // Variable to store the ultimate game result.

    // Extract characters from the first line of input.
    var symbolSequence = parsedLines[0].split('');
    var activeParticipant = 'First'; // Initialize the current player.

    // Function to remove a character from the sequence based on a triplet of indices.
    function extractSymbol(idxTuple) {
        // The second element of the tuple is the index to remove.
        symbolSequence.splice(idxTuple[1], 1);
        // Log the modified sequence to standard output.
        console.log(symbolSequence);
    }

    // Function to check if a removal operation is valid based on a triplet of indices.
    function checkRemovalCondition(idxTuple) {
        // A removal is valid if the characters at the first and third indices are different.
        return !(symbolSequence[idxTuple[0]] === symbolSequence[idxTuple[2]]);
    }

    // Function to attempt a single turn in the game.
    function performMove(symbolCollection) { // 'symbolCollection' parameter is not directly used inside this function.
        var tripleIndices; // Stores the current triplet of indices being examined.

        // Iterate through the sequence, checking for valid removal opportunities.
        for (var loopCounter = 0; loopCounter < (symbolSequence.length - 2); loopCounter++) {
            tripleIndices = [loopCounter, loopCounter + 1, loopCounter + 2]; // Define the current triplet.

            // If a valid removal condition is met for the current triplet.
            if (checkRemovalCondition(tripleIndices)) {
                extractSymbol(tripleIndices); // Perform the removal.
                return true; // Indicate that a move was successfully made.
            }
            // If no move is possible with the current triplet, exit the function immediately.
            return false;
        }
        // This line is unreachable due to the return statement inside the loop.
        return false;
    }

    // Function to manage the overall game progression, alternating turns.
    function runGameLoop() {
        // Continue playing turns until no more moves can be made.
        while (true) {
            // If the current player cannot make a move, the game ends.
            if (performMove(symbolSequence) === false) {
                return; // Exit the game loop.
            }

            // Switch to the next player for the subsequent turn.
            if (activeParticipant === 'First') {
                activeParticipant = 'Second';
            } else {
                activeParticipant = 'First';
            }
        }
    }

    // Start the game by running the turn cycle.
    runGameLoop();

    // Determine the final winner based on whose turn it is when the game ends.
    if (activeParticipant === 'First') {
        finalResult = 'Second'; // If 'First' cannot move, 'Second' wins.
    } else {
        finalResult = 'First'; // If 'Second' cannot move, 'First' wins.
    }

    // Output the final winner to the console.
    console.log(finalResult);
}

// Do not modify the following section (handles standard input/output and calls the main processing function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
