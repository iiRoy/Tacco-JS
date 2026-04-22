const TARGET_WORD_ALPHA = 'apple';
const TARGET_WORD_BETA = 'peach';

// A dictionary to facilitate the word substitution.
const substitutionDictionary = {
    [TARGET_WORD_ALPHA]: TARGET_WORD_BETA,
    [TARGET_WORD_BETA]: TARGET_WORD_ALPHA
};

// Function responsible for printing transformed text segments.
// Encapsulates output logic for potential future changes (e.g., writing to file).
function outputTransformedSegment(processedText) {
    console.log(processedText);
}

// Helper function to execute the word swapping logic.
// Takes a matched word and returns its substitute based on the dictionary.
function applyWordSubstitution(matchedTerm) {
    // Returns the corresponding swapped word from the predefined map.
    return substitutionDictionary[matchedTerm];
}

// The primary routine for processing the entire collected data buffer.
function runTextProcessingEngine() {
    // Pre-check: If no data was gathered, skip processing.
    if (!collectedInputBuffer || collectedInputBuffer.trim().length === 0) {
        // Optionally, one could log a warning here if no input was provided.
        // console.warn("No input data available for the text processing engine.");
        return;
    }

    // Split the accumulated raw data into individual textual units (lines).
    // Filter out any blank lines that might arise from multiple consecutive newlines
    // or leading/trailing newlines in the input stream.
    const textUnitsForProcessing = collectedInputBuffer
                                   .split('\n')
                                   .filter(unit => unit.length > 0);

    // Iterate over each valid text unit and apply the defined transformations.
    for (const currentTextUnit of textUnitsForProcessing) {
        // Construct a regular expression dynamically using the target words.
        // The 'g' flag ensures all occurrences within a line are replaced.
        const replacementPattern = new RegExp(`${TARGET_WORD_ALPHA}|${TARGET_WORD_BETA}`, 'g');

        // Execute the replacement operation, utilizing the helper substitution function.
        const resultantTextUnit = currentTextUnit.replace(replacementPattern, applyWordSubstitution);

        // Display the modified text unit using the dedicated output handler.
        outputTransformedSegment(resultantTextUnit);
    }
}

// Global mutable buffer to accumulate all incoming standard input data.
let collectedInputBuffer = '';

// Sets up and manages the asynchronous standard input stream.
function initializeStandardInputManager() {
    // Ensure the input stream remains open and active to receive data.
    process.stdin.resume();

    // Define the character encoding for the incoming data to ensure correct interpretation.
    process.stdin.setEncoding('utf8');

    // Attach an event listener to handle 'data' chunks as they arrive.
    process.stdin.on('data', (dataChunk) => {
        // Append each new chunk of data to the global buffer.
        collectedInputBuffer += dataChunk;
    });

    // Attach an event listener for the 'end' of the input stream.
    // This signifies that all input has been received and it's time to process.
    process.stdin.on('end', () => {
        // Trigger the core text processing function once input collection is complete.
        runTextProcessingEngine();
    });

    // Implement a basic error handler for the standard input stream.
    // This provides robustness against potential I/O issues.
    process.stdin.on('error', (ioError) => {
        console.error("An unrecoverable error occurred during standard input operations:", ioError);
        process.exit(1); // Exit the process with a non-zero status code to indicate failure.
    });
}

// Initiate the input stream management process to begin listening for data.
initializeStandardInputManager();