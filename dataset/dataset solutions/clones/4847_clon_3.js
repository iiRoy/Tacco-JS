function GameProcessor(rawInputData) {
    // This routine processes the game's initial state from raw input.
    // Ensure input is not null or empty before proceeding.
    if (!rawInputData || rawInputData.trim().length === 0) {
        console.error("Input data is missing or empty. Cannot proceed.");
        return; // Early exit
    }

    // Split the input string by newline characters to get individual lines.
    const processedLines = rawInputData.split('\n');
    let finalGameResult; // Variable to store the name of the winning participant.

    // Extract the sequence of symbols for the game from the first line of input.
    // Each character becomes an element in our dynamic symbol array.
    let gameSymbolSequence = processedLines[0].split('');

    // Define the participants and track whose turn it is using an index.
    const gameParticipants = ['PlayerAlpha', 'PlayerBeta'];
    let currentParticipantIndex = 0; // 0 for PlayerAlpha, 1 for PlayerBeta

    /**
     * Executes the removal of a symbol from the game sequence.
     * This function directly modifies the global 'gameSymbolSequence' array.
     * @param {number} eliminationPosition - The 0-based index of the symbol to remove.
     */
    const performSymbolRemoval = (eliminationPosition) => {
        // Splice removes elements from an array and modifies it in place.
        // We remove 1 element starting from 'eliminationPosition'.
        gameSymbolSequence.splice(eliminationPosition, 1);
        // A more verbose way could be:
        // gameSymbolSequence = gameSymbolSequence.slice(0, eliminationPosition).concat(gameSymbolSequence.slice(eliminationPosition + 1));
    };

    /**
     * Determines if a potential move is valid based on a three-symbol segment.
     * A move is valid if the first and third symbols of the segment are different.
     * @param {number} firstSymbolIdx - The index of the first symbol in the triplet.
     * @param {number} thirdSymbolIdx - The index of the third symbol in the triplet.
     * @returns {boolean} True if the move is valid, false otherwise.
     */
    const evaluateMoveValidity = (firstSymbolIdx, thirdSymbolIdx) => {
        // Retrieve the characters at the specified positions for comparison.
        const charAtFirst = gameSymbolSequence[firstSymbolIdx];
        const charAtThird = gameSymbolSequence[thirdSymbolIdx];

        // The condition for a valid move is that the two characters must not be identical.
        return charAtFirst !== charAtThird;
    };

    /**
     * Attempts to execute a single turn for the current participant.
     * It iterates through possible three-symbol segments to find a valid move.
     * If a valid move is found, it's executed, and the function returns true.
     * If no valid moves are found, the turn cannot be completed, and false is returned.
     * @returns {boolean} True if a move was successfully made, false otherwise.
     */
    const executePlayerTurn = () => {
        let successfulMoveMade = false; // Flag to track if the current participant made a move.
        const minimumLengthForTriplet = 3; // A triplet requires at least 3 symbols.

        // Loop through the symbol sequence, checking for valid triplets.
        // The loop continues as long as there are at least 3 symbols remaining to form a triplet.
        for (let k = 0; k <= (gameSymbolSequence.length - minimumLengthForTriplet); k++) {
            // Define the indices for the current three-symbol segment.
            const currentTripletFirstIdx = k;
            const currentTripletMiddleIdx = k + 1;
            const currentTripletThirdIdx = k + 2;

            // Check if the current triplet allows for a valid move.
            if (evaluateMoveValidity(currentTripletFirstIdx, currentTripletThirdIdx)) {
                // If the move is valid, perform the symbol removal.
                performSymbolRemoval(currentTripletMiddleIdx);
                successfulMoveMade = true; // Mark that a move was made.
                break; // Exit the loop as one move per turn is sufficient.
            }
        }
        return successfulMoveMade; // Report whether a move was executed.
    };

    /**
     * Manages the overall flow of the game, cycling turns between participants.
     * The game continues as long as participants can make valid moves.
     * The game ends when a participant cannot make any move.
     */
    const conductGameSession = () => {
        let gameActive = true; // Flag to control the main game loop.

        // The game proceeds in turns until no participant can make a valid move.
        while (gameActive) {
            // Attempt to make a move for the current participant.
            const moveWasPossible = executePlayerTurn();

            if (!moveWasPossible) {
                // If the current participant cannot make a move, the game concludes.
                gameActive = false; // Terminate the game loop.
            } else {
                // If a move was successfully made, switch to the next participant.
                // This flips the index between 0 and 1.
                currentParticipantIndex = 1 - currentParticipantIndex;
            }
        }
    };

    // Initiate the game session.
    conductGameSession();

    // After the game concludes, determine the winning participant.
    // The participant who could NOT make a move is the loser.
    // Therefore, the *other* participant is the winner.
    const losingParticipantIdentifier = gameParticipants[currentParticipantIndex];
    finalGameResult = gameParticipants[1 - currentParticipantIndex];

    // Output the name of the participant who won the game.
    console.log(finalGameResult);
}

// Do not modify the code below this line (standard input/output handling).
GameProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));