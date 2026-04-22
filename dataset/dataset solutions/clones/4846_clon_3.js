// Raw input data will be processed by this function
function GameProcessor(rawData) {
    // Splits the entire raw input string into an array of lines
    const parsedInputLines = rawData.split('\n');

    // Variable to store the name of the victorious participant
    let victoriousParticipantIdentifier;

    // The dynamic sequence of symbols that players manipulate throughout the game
    let symbolSequence = parsedInputLines[0].split('');

    // Define constants for distinct player identification
    const PRIMARY_PLAYER_TAG = 'AlphaPlayer';
    const SECONDARY_PLAYER_TAG = 'BetaPlayer';
    // The minimum number of symbols required in the sequence to attempt any move
    const MINIMUM_SEQUENCE_FOR_MOVE = 3;

    // Tracks which participant's turn it is currently
    let currentTurnHolder = PRIMARY_PLAYER_TAG;

    // Optional: A counter for the total number of successful operations (symbol removals)
    let totalOperationsExecuted = 0;

    /**
     * Executes the action of removing a symbol from the game sequence.
     * Specifically, it targets the middle symbol of a identified triplet.
     * @param {number[]} segmentCoordinates - An array [start_idx, middle_idx, end_idx] representing symbol positions.
     */
    function executeSymbolRemoval(segmentCoordinates) {
        // Remove one symbol at the specified middle index
        symbolSequence.splice(segmentCoordinates[1], 1);
        totalOperationsExecuted++; // Increment the counter for performed actions
    }

    /**
     * Evaluates whether a potential move (symbol removal) is valid according to game rules.
     * A move is considered valid if the first and third symbols of the triplet are not identical.
     * @param {number[]} segmentCoordinates - An array [start_idx, middle_idx, end_idx] for symbol positions.
     * @returns {boolean} - Returns true if the move is permissible, false otherwise.
     */
    function assessMoveLegality(segmentCoordinates) {
        // Extract the indices of the boundary symbols for clarity
        const firstSymbolPosition = segmentCoordinates[0];
        const thirdSymbolPosition = segmentCoordinates[2];

        // The core rule: first and third symbols must differ
        return symbolSequence[firstSymbolPosition] !== symbolSequence[thirdSymbolPosition];
    }

    /**
     * Attempts to complete a single turn for the current participant.
     * The participant scans the symbol sequence from left to right for the first valid triplet.
     * @returns {boolean} - Returns true if a move was successfully identified and executed, false if no valid move could be made.
     */
    function tryToMakeMove() {
        // Pre-check: If the sequence is too short, no move is possible
        if (symbolSequence.length < MINIMUM_SEQUENCE_FOR_MOVE) {
            return false;
        }

        // Iterate through all possible starting positions for a three-symbol segment
        for (let position = 0; position <= (symbolSequence.length - MINIMUM_SEQUENCE_FOR_MOVE); position++) {
            const currentSegmentCoordinates = [position, position + 1, position + 2];

            // If the current segment allows for a valid move
            if (assessMoveLegality(currentSegmentCoordinates)) {
                executeSymbolRemoval(currentSegmentCoordinates); // Perform the symbol removal
                return true; // The turn was successful
            }
        }
        // If the loop completes without finding any valid move
        return false;
    }

    /**
     * Orchestrates the primary game flow, managing alternating turns between participants.
     * The game proceeds until a participant is unable to perform any valid action.
     */
    function conductGameRounds() {
        let currentRoundNumber = 0;
        // A safety mechanism to prevent potential infinite loops in unexpected scenarios
        const MAXIMUM_GAME_ROUNDS_LIMIT = 50000;

        // The game continues indefinitely until explicitly broken
        while (true) {
            // Enforce a hard limit on the number of rounds
            if (currentRoundNumber >= MAXIMUM_GAME_ROUNDS_LIMIT) {
                // This scenario indicates a problem if reached under normal game rules
                // console.warn("Game exceeded maximum round limit. Terminating to prevent infinite loop.");
                break;
            }

            // The current participant attempts to make their move
            const moveWasCompleted = tryToMakeMove();

            // If the active participant could not make a move, the game concludes
            if (!moveWasCompleted) {
                break; // Exit the game loop, as no further moves are possible
            }

            // Switch the turn to the other participant using a ternary operator for brevity
            currentTurnHolder = (currentTurnHolder === PRIMARY_PLAYER_TAG) ?
                                SECONDARY_PLAYER_TAG :
                                PRIMARY_PLAYER_TAG;
            currentRoundNumber++;
        }
    }

    // Initiate the game simulation
    conductGameRounds();

    // Determine the victor: The participant whose turn it *was* (currentTurnHolder)
    // is the one who failed to make a move, so the *other* participant is the winner.
    victoriousParticipantIdentifier = (currentTurnHolder === PRIMARY_PLAYER_TAG) ?
                                      SECONDARY_PLAYER_TAG :
                                      PRIMARY_PLAYER_TAG;

    // Display the identifier of the winning participant to the console
    console.log(victoriousParticipantIdentifier);
}

// Do not modify the lines below this point; they handle standard input/output and call the main game function.
GameProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));