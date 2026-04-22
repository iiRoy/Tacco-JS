// Utility for acquiring raw input from stdin
function obtainInputText() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

// Creates an iterable generator for lines from the input text
function* createLineIterator(textSource) {
    const lines = textSource.split("\n");
    for (const line of lines) {
        yield line;
    }
}

// A collection of functions to transform input strings based on a key
const dataTransformers = {
    numericValue: (val) => parseInt(val),
    spaceSeparatedTokens: (val) => val.split(" "),
    spaceSeparatedNumbers: (val) => val.split(" ").map(Number),
    singleCharacters: (val) => val.split("")
};

// Applies a specified transformation to a given value
function performTransformation(value, operationKey) {
    try {
        const transformer = dataTransformers[operationKey];
        return transformer ? transformer(value) : value;
    } catch (e) {
        // In case of error during transformation, return original value as per original logic
        return value;
    }
}

// Global variable to hold the current input line iterator state
let currentLineIteratorState;

// Initializes the input stream by setting up the line iterator
function setupReader() {
    currentLineIteratorState = createLineIterator(obtainInputText());
}

// Retrieves the next line from the input stream
function extractNextLine() {
    const { value, done } = currentLineIteratorState.next();
    if (done) {
        // Custom error message, different from original's specific string
        throw new Error("Input stream exhausted. No more data available.");
    }
    return value;
}

// Specific input retrieval functions using the general transformation utility
function retrieveInt() { return performTransformation(extractNextLine(), "numericValue"); }
function retrieveStrArray() { return performTransformation(extractNextLine(), "spaceSeparatedTokens"); }
function retrieveIntArray() { return performTransformation(extractNextLine(), "spaceSeparatedNumbers"); }
function retrieveCharArray() { return performTransformation(extractNextLine(), "singleCharacters"); }

// Function for standard output
function presentResult(value) { console.log(value); }

// Function for error output (unused in this specific problem but kept for completeness based on original)
function signalError(value) { console.error(value); }

// Pure function to determine score change for a single character based on its properties
function calculateCharScore(character, position, totalLength) {
    const isPositionEven = (position % 2 === 0);
    const isPositionLast = (position === totalLength - 1);

    if (character === 'g') {
        // 'g' grants +1 only if at an even position and not the last character
        return (isPositionEven && !isPositionLast) ? 1 : 0;
    } else if (character === 'p') {
        // 'p' subtracts -1 if at an odd position, OR if at an even position AND it is the last character
        return (!isPositionEven || (isPositionEven && isPositionLast)) ? -1 : 0;
    }
    return 0; // Other characters or conditions yield no score change
}

// Main orchestration function, replacing the original 'Main' function
function orchestrateProcessing() {
    setupReader(); // First, initialize the input system

    const providedSequence = extractNextLine(); // Read the first line of input
    
    // Process the sequence using a functional reduction over its characters
    const finalTally = Array.from(providedSequence).reduce((currentAccumulator, charElement, elementIndex, fullArray) => {
        return currentAccumulator + calculateCharScore(charElement, elementIndex, fullArray.length);
    }, 0); // Start with an initial score of 0

    presentResult(finalTally); // Display the final calculated tally
}

// Execute the entire processing flow
orchestrateProcessing();