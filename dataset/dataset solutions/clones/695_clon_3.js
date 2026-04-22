// This JavaScript code simulates a card shuffling process,
// acting as a Type III clone of the provided Java source.
// It includes significant structural changes, identifier renames,
// and additions/rewrites while preserving the core logic.

// --- Input Simulation Mechanism (Type III Addition) ---
// In a typical JavaScript environment (e.g., browser or Node.js without `readline-sync`),
// standard input isn't directly available like Java's Scanner.
// This section provides a simple, in-memory buffer to simulate reading integer inputs,
// which is a common practice in competitive programming setups for testing.
// In a production environment, this would be replaced by actual input sources.
let _simulatedInputBuffer = []; // Stores lines of input as strings.
let _inputCursor = 0;           // Tracks the current position in the input buffer.

/**
 * Fetches and parses the next integer from the simulated input buffer.
 * This function replaces Java's `sc.nextInt()`.
 * @returns {number} The next integer value from the input.
 */
const fetchNextInteger = () => {
    // A robust application would include more comprehensive error handling,
    // but for this cloning exercise, we assume valid integer inputs are provided.
    if (_inputCursor >= _simulatedInputBuffer.length) {
        // If we run out of input, return 0 to allow the main loop's termination
        // condition (0, 0) to eventually be met, preventing an infinite loop.
        console.error("Warning: Ran out of simulated input. Returning 0 to prevent infinite loop.");
        return 0;
    }
    // Parse the string from the buffer into an integer.
    const numericValue = parseInt(_simulatedInputBuffer[_inputCursor], 10);
    _inputCursor++; // Advance the cursor to the next input item.
    return numericValue;
};

// --- Main Program Logic (Encapsulated Function - Type III Addition) ---
// The core simulation logic is wrapped in a named function for better organization
// and to avoid polluting the global scope, a common JavaScript practice.
const executeCardShufflingScenario = () => {
    // Declare variables to hold the current deck size and the number of shuffle operations.
    let currentDeckSize;    // Renamed from 'n'
    let numberOfOperations; // Renamed from 'r'

    // The primary loop continually processes sets of card shuffling instructions
    // until a specific termination signal is received.
    while (true) {
        // First, read the total count of cards for the current deck.
        currentDeckSize = fetchNextInteger();

        // Next, read how many shuffling operations are to be performed on this deck.
        numberOfOperations = fetchNextInteger();

        // --- Termination Condition (Identical functionality, strict equality - Type II Change) ---
        // If both the deck size and the number of operations are zero,
        // it signifies the end of the simulation, and the loop breaks.
        if (currentDeckSize === 0 && numberOfOperations === 0) {
            break; // Exit the main simulation loop.
        }

        // --- Deck Initialization (Type III Rewrite: using Array.from) ---
        // Initialize the array representing the card deck.
        // Cards are numbered in descending order, from 'currentDeckSize' down to 1.
        // Example: if currentDeckSize = 5, the deck starts as [5, 4, 3, 2, 1].
        let playingCardCollection = Array.from({ length: currentDeckSize }, (_, index) => currentDeckSize - index);
        // Original Java equivalent (imperative loop):
        // let playingCardCollection = [];
        // for (let cardPosition = 0; cardPosition < currentDeckSize; cardPosition++) {
        //     playingCardCollection[cardPosition] = currentDeckSize - cardPosition;
        // }

        // --- Shuffle Operations Loop (Type II Renaming) ---
        // Iterate through each shuffling instruction for the current deck.
        for (let operationIndex = 0; operationIndex < numberOfOperations; operationIndex++) {
            // Read the parameters for the current shuffle operation:
            // 'initialSkipCount' (renamed from 'p'): The number of cards to skip from the top
            //   before identifying the block to move. Input is 1-indexed, so convert to 0-indexed.
            // 'blockCardCount' (renamed from 'c'): The number of cards in the block that will be moved.
            let initialSkipCount = fetchNextInteger() - 1; // Convert 1-based index to 0-based.
            let blockCardCount = fetchNextInteger();

            // --- Core Shuffle Logic (Type III Rewrite: using slice and spread for array manipulation) ---
            // This section dramatically rewrites the original Java's explicit loops for array manipulation
            // into a more declarative and idiomatic JavaScript style using `slice` for extraction
            // and the spread operator (`...`) for reassembly.
            // The shuffle operation conceptually works as follows:
            // Original deck: [Cards_A | Cards_B | Cards_C]
            // Where Cards_A are the first 'initialSkipCount' cards.
            //       Cards_B are the next 'blockCardCount' cards.
            //       Cards_C are the remaining cards.
            // The goal is to transform the deck to: [Cards_B | Cards_A | Cards_C].

            // 1. Extract 'Cards_A': The segment of cards to be skipped initially.
            const segmentOfSkippedCards = playingCardCollection.slice(0, initialSkipCount);

            // 2. Extract 'Cards_B': The segment of cards that will be moved to the front.
            // This segment starts immediately after 'Cards_A'.
            const segmentOfMovedCards = playingCardCollection.slice(
                initialSkipCount,
                initialSkipCount + blockCardCount
            );

            // 3. Extract 'Cards_C': The remaining segment of cards in the deck.
            // This segment starts after 'Cards_A' and 'Cards_B'.
            const segmentOfRemainingCards = playingCardCollection.slice(
                initialSkipCount + blockCardCount
            );

            // 4. Reassemble the deck: 'Cards_B' first, then 'Cards_A', then 'Cards_C'.
            playingCardCollection = [...segmentOfMovedCards, ...segmentOfSkippedCards, ...segmentOfRemainingCards];

            // --- Optional Guard Clause (Type III Addition) ---
            // This type of validation was not present in the original Java code but could be added
            // as a robustness enhancement in a Type III clone.
            // if (initialSkipCount < 0 || initialSkipCount >= currentDeckSize ||
            //     blockCardCount < 0 || blockCardCount > currentDeckSize - initialSkipCount) {
            //     console.warn(`Invalid shuffle parameters detected (p=${initialSkipCount+1}, c=${blockCardCount}) for deck size ${currentDeckSize}. Operation skipped.`);
            //     // Depending on requirements, one might `continue` or throw an error here.
            // }
        }

        // --- Output Result (Type II Renaming & Type III Addition for safety) ---
        // After all shuffle operations for the current deck are finished,
        // print the value of the card that is now at the very top (index 0) of the deck.
        // Added a check to ensure the array is not empty before accessing its first element.
        if (playingCardCollection.length > 0) {
            console.log(playingCardCollection[0]);
        } else {
            // This case should ideally not be reached if initial 'currentDeckSize' is always positive
            // when operations are performed, but it's a good defensive programming practice.
            // console.warn("The card deck is empty; cannot display the top card.");
        }
    }
};

// --- Test Data Setup (Type III Addition) ---
// This section populates the simulated input buffer with sample data.
// In a real execution environment (e.g., competitive programming platform),
// this data would come from standard input (stdin).
_simulatedInputBuffer = [
    "5", "1",    // Test Case 1: Deck size = 5, 1 shuffle operation
    "2", "2",    // Shuffle 1: p=2, c=2 (0-indexed p=1, c=2)
                 // Initial: [5,4,3,2,1]
                 // X=[5], Y=[4,3], Z=[2,1]
                 // Result: [4,3,5,2,1] -> Top card: 4

    "3", "2",    // Test Case 2: Deck size = 3, 2 shuffle operations
    "2", "1",    // Shuffle 1: p=2, c=1 (0-indexed p=1, c=1)
                 // Initial: [3,2,1]
                 // X=[3], Y=[2], Z=[1]
                 // Result: [2,3,1]
    "2", "1",    // Shuffle 2: p=2, c=1 (0-indexed p=1, c=1)
                 // Current: [2,3,1]
                 // X=[2], Y=[3], Z=[1]
                 // Result: [3,2,1] -> Top card: 3

    "0", "0"     // Termination signal: Deck size = 0, operations = 0
];

// --- Execution Start ---
// Call the main function to begin the card shuffling simulation.
executeCardShufflingScenario();