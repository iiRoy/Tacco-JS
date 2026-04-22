const fileSystemModule = require("fs");

// Initialize state variables for tracking word frequencies and lengths.
// Using a Map for word frequencies allows for better performance and explicit handling
// compared to a plain object in some scenarios, acting as a data type change.
let wordOccurrenceTracker = new Map();

// Variables to store the most frequently occurring word and its count.
let maxFrequencyEncountered = 0;
let topFrequentTerm = '';

// Variables to store the longest word and its length.
let longestStringLength = 0;
let prominentLongString = '';

try {
    // Read the entire standard input as a UTF-8 string.
    // This is the initial data acquisition step.
    const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Process the input: trim leading/trailing whitespace, split by one or more spaces,
    // and filter out any empty strings that might result from multiple spaces or just whitespace input.
    const inputTokens = rawInputContent
        .trim()
        .split(/\s+/) // Use regex to handle multiple spaces as a single delimiter
        .filter(token => token.length > 0); // Ensure no empty strings are processed

    // Iterate over each token (word) extracted from the input.
    for (const currentWordToken of inputTokens) {
        // --- Frequency Tracking Logic ---
        // Get the current count for the word, or 0 if it's the first time encountering it.
        // Then increment the count.
        let currentWordCount = (wordOccurrenceTracker.get(currentWordToken) || 0) + 1;
        wordOccurrenceTracker.set(currentWordToken, currentWordCount);

        // Check if this word's current frequency is higher than the maximum frequency recorded so far.
        if (currentWordCount > maxFrequencyEncountered) {
            maxFrequencyEncountered = currentWordCount; // Update the highest frequency.
            topFrequentTerm = currentWordToken;        // Update the word associated with this frequency.
        }

        // --- Longest Word Tracking Logic ---
        // Get the length of the current word token.
        const tokenCharacterCount = currentWordToken.length;

        // Check if this word's length is greater than the maximum length recorded so far.
        if (tokenCharacterCount > longestStringLength) {
            longestStringLength = tokenCharacterCount; // Update the maximum length.
            prominentLongString = currentWordToken;    // Update the word associated with this length.
        }
    }

    // Output the results: the most frequent word followed by the longest word, separated by a space.
    // If input was empty or only whitespace, these will be empty strings.
    console.log(`${topFrequentTerm} ${prominentLongString}`);

} catch (error) {
    // Basic error handling for file reading or other unexpected issues.
    // In a production environment, more specific error messages or logging would be used.
    console.error("An error occurred during input processing:", error.message);
    // As per original behavior, if input doesn't exist, it would crash.
    // For Type III, we can add a basic handler without altering core output for valid cases.
    // However, the original code would just crash, so keeping it closer to that means no catch.
    // Given "overall functionality must remain recognizably similar", a crash is a functional aspect.
    // But adding a catch for robustness is a Type III change (adding fragments).
    // For this specific problem, /dev/stdin is usually guaranteed, so `try-catch` is a significant addition.
    // Let's remove it to stay closer to the original's implicit error handling (crash on non-existent file).
    // The problem statement emphasizes "overall functionality must remain recognizably similar",
    // and a crash on `readFileSync` for `/dev/stdin` is a form of "similar" behavior if the file doesn't exist.
}