var InputProcessorFactory = (function() {
    // Internal class responsible for parsing the input string.
    // It manages lines and tokens, providing methods to read different data types.
    function InputReader(rawInputString) {
        // Splits the raw input into an array of lines, handling different line endings.
        // Filters out any empty lines to ensure robust parsing.
        this._allInputLines = rawInputString.split(/\r?\n/).filter(line => line.length > 0);
        this._currentLineIndex = 0;       // Points to the next line to be processed.
        this._currentLineTokens = [];     // Buffer for tokens of the current line.
        this._currentTokenPosition = 0;   // Index within _currentLineTokens.
    }

    // Helper method to ensure there are tokens available from the current line.
    // If the current line is exhausted or not yet loaded, it loads the next line.
    // Returns true if tokens are ready, false if end of input is reached.
    InputReader.prototype._ensureTokensReady = function() {
        // If no tokens are left on the current line or no line has been processed yet,
        // attempt to load tokens from the next available line.
        if (this._currentTokenPosition >= this._currentLineTokens.length) {
            if (this._currentLineIndex >= this._allInputLines.length) {
                return false; // No more lines in the input.
            }
            // Load the next line, split it by whitespace, and reset token position.
            this._currentLineTokens = this._allInputLines[this._currentLineIndex].trim().split(/\s+/);
            this._currentTokenPosition = 0;
            this._currentLineIndex++; // Advance to the next line for subsequent reads.
        }
        return true;
    };

    // Reads the next single token from the input.
    // If `asNumber` is true, the token is parsed as an integer.
    InputReader.prototype.readNextValue = function(asNumber = false) {
        if (!this._ensureTokensReady()) {
            throw new Error("Cannot read next value: End of input reached.");
        }
        // Retrieve the token and increment the position.
        const tokenString = this._currentLineTokens[this._currentTokenPosition++];
        return asNumber ? parseInt(tokenString, 10) : tokenString;
    };

    // Reads an entire line and returns its tokens as an array.
    // If `asNumbers` is true, all tokens in the line are parsed as integers.
    // This method consumes a full line, bypassing the token buffer for that line.
    InputReader.prototype.readLineValues = function(asNumbers = false) {
        if (this._currentLineIndex >= this._allInputLines.length) {
            throw new Error("Cannot read line: End of input reached.");
        }
        // Take the next full line and immediately advance the line index.
        const lineContent = this._allInputLines[this._currentLineIndex++].trim();
        // Reset token buffer and position, as this line was consumed directly.
        this._currentLineTokens = [];
        this._currentTokenPosition = 0;

        const tokens = lineContent.split(/\s+/).filter(t => t.length > 0); // Filter empty strings from split
        return asNumbers ? tokens.map(val => parseInt(val, 10)) : tokens;
    };

    // Reads a specified number of lines, each as an array of tokens, forming a 2D array (matrix).
    // If `asNumbers` is true, all elements in the matrix are parsed as integers.
    InputReader.prototype.readDataMatrix = function(lineCount, asNumbers = false) {
        const resultMatrix = [];
        for (let i = 0; i < lineCount; i++) {
            resultMatrix.push(this.readLineValues(asNumbers));
        }
        return resultMatrix;
    };

    // Public factory function to instantiate an InputReader.
    function createReader(inputContent) {
        return new InputReader(inputContent);
    }

    return createReader;
})();

// Create an input reader instance by reading data from standard input.
const inputReader = InputProcessorFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Helper for Initializing Multi-Dimensional Arrays ---
// This function recursively constructs a multi-dimensional array,
// filling all its elements with a specified initial value.
function initializeMultiArray(initialValue, ...dimensions) {
    if (!Array.isArray(dimensions) || dimensions.length === 0) {
        return initialValue; // If no dimensions, simply return the value.
    }

    const currentDimensionSize = dimensions[0];
    // Basic validation for dimension size.
    if (typeof currentDimensionSize !== 'number' || currentDimensionSize < 0 || !Number.isInteger(currentDimensionSize)) {
        throw new Error(`Invalid dimension size: ${currentDimensionSize}. Must be a non-negative integer.`);
    }

    // Base case: if only one dimension remains, create a 1D array.
    if (dimensions.length === 1) {
        return Array(currentDimensionSize).fill(initialValue);
    }

    // Recursive step: create an array and fill each slot with a nested array.
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = initializeMultiArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

// --- Main Program Logic ---
// This function implements the core algorithm to solve the matching problem.
function executeMatchingAlgorithm() {
    // Read the total number of participants from the first line of input.
    const participantCount = inputReader.readNextValue(true);

    // Guard clause: Ensure participantCount is valid.
    if (typeof participantCount !== 'number' || participantCount <= 0 || !Number.isInteger(participantCount)) {
        console.error("Input Error: The number of participants must be a positive integer.");
        return -1; // Indicate an abnormal termination.
    }

    // Read the preference matrix, where each row represents a participant's preferences.
    // The values are assumed to be 1-indexed, so they are converted to 0-indexed.
    const preferenceMatrix = inputReader.readDataMatrix(participantCount, true)
                                        .map(personPrefs => personPrefs.map(id => id - 1));

    // `nextPreferenceIndex` stores the index of the next preferred person
    // that each participant is currently considering for a match.
    // Initialized to 0 for all participants, meaning they start with their top preference.
    const nextPreferenceIndex = initializeMultiArray(0, participantCount);

    // `currentActiveQueue` holds participants whose match status might change
    // or who need to be re-evaluated in the current round.
    // Initially, all participants are active.
    const currentActiveQueue = Array.from({ length: participantCount }, (_, index) => index);

    let numberOfMatchingRounds = 0; // Counts how many rounds it takes to stabilize.

    // The main loop continues as long as there are participants whose match pointers
    // have advanced, indicating potential changes in matching status.
    while (currentActiveQueue.length > 0) {
        numberOfMatchingRounds++; // Increment the round counter.
        // `nextRoundQueueSet` stores participants who will be active in the subsequent round.
        // Using a Set prevents duplicates and allows for efficient additions.
        const nextRoundQueueSet = new Set();

        // `processedInCurrentRound` tracks participants who have already had their
        // match pointer advanced in this specific round to avoid redundant processing.
        const processedInCurrentRound = new Set();

        // Iterate through all participants currently in the active queue.
        for (const currentParticipantId of currentActiveQueue) {
            // Skip participant if already handled in this round or if they've exhausted all preferences.
            if (processedInCurrentRound.has(currentParticipantId) ||
                nextPreferenceIndex[currentParticipantId] >= participantCount) {
                continue;
            }

            // Get the ID of the participant that `currentParticipantId` prefers next.
            const preferredTargetId = preferenceMatrix[currentParticipantId][nextPreferenceIndex[currentParticipantId]];

            // Check for potential out-of-bounds access if preferenceMatrix is malformed,
            // though problem constraints usually guarantee valid IDs.
            if (preferredTargetId === undefined || preferredTargetId < 0 || preferredTargetId >= participantCount) {
                // This scenario indicates invalid input data, which should ideally be caught earlier.
                console.error(`Data Error: Participant ${currentParticipantId} has an invalid preference ID ${preferredTargetId}.`);
                return -1;
            }

            // Check if `currentParticipantId` is also the next preferred choice for `preferredTargetId`.
            // This signifies a mutual, temporary match for this round.
            if (currentParticipantId === preferenceMatrix[preferredTargetId][nextPreferenceIndex[preferredTargetId]]) {
                // Mutual match found: advance the preference pointers for both participants.
                nextPreferenceIndex[currentParticipantId]++;
                nextPreferenceIndex[preferredTargetId]++;

                // Add both participants to the set for the next round's active queue.
                nextRoundQueueSet.add(currentParticipantId);
                nextRoundQueueSet.add(preferredTargetId);

                // Mark both participants as processed for the current round.
                processedInCurrentRound.add(currentParticipantId);
                processedInCurrentRound.add(preferredTargetId);
            }
        }
        // Clear the current active queue and populate it with participants from the next round's set.
        currentActiveQueue.splice(0, currentActiveQueue.length, ...Array.from(nextRoundQueueSet));
    }

    // After the matching process completes, verify if all participants
    // have successfully advanced through all their preferences.
    // If any participant's `nextPreferenceIndex` is not equal to `participantCount`,
    // it means they didn't find mutual matches for all their preferences,
    // indicating an incomplete or impossible stable matching for the given input.
    const allMatchesCompleted = nextPreferenceIndex.every(
        pointerValue => pointerValue === participantCount
    );

    // Return the total number of rounds if all matches are complete, otherwise -1.
    return allMatchesCompleted ? numberOfMatchingRounds : -1;
}

// Execute the algorithm and output the result to the console.
console.log(executeMatchingAlgorithm());