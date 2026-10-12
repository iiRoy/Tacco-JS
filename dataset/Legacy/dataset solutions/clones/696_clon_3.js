const fileSystem = require('fs');
const RAW_INPUT_FILE_PATH = '/dev/stdin';
const FILE_ENCODING = 'utf8';
const LINE_SEPARATOR = '\n';
const VALUE_SEPARATOR = ' ';
const ZERO_CONSTANT = 0; // Used for termination condition and array indexing

// Helper function to create an initial deck of cards
function initializeCardDeck(deckSize) {
    const newDeck = [];
    for (let cardIdentifier = deckSize; cardIdentifier > ZERO_CONSTANT; cardIdentifier--) {
        newDeck.push(cardIdentifier);
    }
    return newDeck;
}

// Helper function to perform a single card manipulation operation
function executeCardOperation(currentStack, startPosition, cardsToMoveCount) {
    // Adjust the start position to be 0-indexed for array methods
    const actualStartIndex = startPosition - 1;

    // Extract the specified number of cards from the stack
    // splice returns an array containing the removed elements
    const extractedSegment = currentStack.splice(actualStartIndex, cardsToMoveCount);

    // The original logic effectively reverses the order of the extracted cards
    // and then places them at the very top (beginning) of the main stack.
    extractedSegment.reverse();

    // Prepend the now-reversed segment of cards to the main stack
    currentStack.unshift(...extractedSegment);
}

const rawInputData = fileSystem.readFileSync(RAW_INPUT_FILE_PATH, FILE_ENCODING).trim();
const inputDataLines = rawInputData.split(LINE_SEPARATOR);

let currentInputLine;
// Loop through each test case provided in the input
while ((currentInputLine = inputDataLines.shift()) !== undefined) {
    const caseNumericParameters = currentInputLine.split(VALUE_SEPARATOR);
    const numberOfCards = Number(caseNumericParameters[ZERO_CONSTANT]);
    const numberOfOperations = Number(caseNumericParameters[1]);

    // Check for the termination condition (N=0 and R=0)
    if (numberOfCards + numberOfOperations === ZERO_CONSTANT) {
        break;
    }

    // Create the initial deck for the current test case
    const cardStack = initializeCardDeck(numberOfCards);

    // Process each operation for the current test case
    for (let operationIndex = ZERO_CONSTANT; operationIndex < numberOfOperations; operationIndex++) {
        const operationDetails = inputDataLines.shift().split(VALUE_SEPARATOR).map(valueString => Number(valueString));
        const positionToExtract = operationDetails[ZERO_CONSTANT];
        const cardsToMove = operationDetails[1];

        // Apply the card manipulation using the dedicated helper function
        executeCardOperation(cardStack, positionToExtract, cardsToMove);
    }
    // Output the value of the top card after all operations
    console.log(cardStack[ZERO_CONSTANT]);
}
