// Function to handle and process incoming textual data.
// This routine determines a unique element count based on specific criteria.
function ProcessTextualData(rawInputPayload) {
    // --- Input Validation and Preparation (Type III Additions) ---
    // Guard clause: Ensure the payload is not empty or just whitespace.
    if (!rawInputPayload || rawInputPayload.trim().length === 0) {
        // In a real application, one might log an error or return a specific status.
        // For this exercise, we'll simply exit, implying no output for invalid input.
        return;
    }

    // Split the entire input payload into individual lines.
    const inputLines = rawInputPayload.split('\n');

    // Validation: Ensure there are at least two lines for processing.
    // The original logic implicitly assumes this structure.
    if (inputLines.length < 2) {
        // console.error("Insufficient lines provided in the input payload."); // Example error logging
        return;
    }

    // The first line (original 'len') is not used in the core logic,
    // so we can omit processing it entirely (Type III Deletion).
    // const firstLineString = inputLines[0]; // This line is now completely removed.

    // Extract the second line and split it into an array of string tokens.
    // These tokens represent the items to be analyzed for uniqueness.
    const tokenSequence = inputLines[1].split(' ');

    // --- Unique Element Counting (Type III Rewrite/Update) ---
    // Instead of an array and `indexOf`, we use a `Set` for efficient
    // storage and retrieval of unique elements. This is a significant
    // structural change achieving the same functional outcome.
    const observedElements = new Set(); // Stores truly unique items.

    // Helper variable for readability in the loop.
    const currentSequenceLength = tokenSequence.length;

    // Iterate through each token in the sequence.
    for (let idx = 0; idx < currentSequenceLength; idx++) {
        const currentItemIdentifier = tokenSequence[idx];

        // Type III Addition: Add a check to ignore empty strings that might result from split
        // if there are multiple spaces or leading/trailing spaces.
        if (currentItemIdentifier.trim() !== '') {
            observedElements.add(currentItemIdentifier);
        }
    }

    // Get the final count of unique items from the Set.
    const uniqueItemCounter = observedElements.size;

    // --- Conditional Output Logic (Type III Update) ---
    let finalResultValue;

    // Determine the output based on whether the unique count is odd or even.
    // This logic is equivalent to the original `if(count % 2 == 1)` structure.
    const isUniqueCountEven = (uniqueItemCounter % 2 === 0);

    if (isUniqueCountEven) {
        // If the count is even, decrement it by one as per the original specification.
        finalResultValue = uniqueItemCounter - 1;
    } else {
        // If the count is odd, use the count as is.
        finalResultValue = uniqueItemCounter;
    }

    // Type III Addition: Use an intermediate variable for output for potential further processing.
    const valueToLog = finalResultValue;
    console.log(valueToLog);
}

// --- Input Reading Mechanism (Type III Additions/Updates) ---
// This section handles reading input from the standard input stream.
const fileSystemAccessModule = require("fs"); // Renamed module variable
const standardInputDevicePath = "/dev/stdin"; // Renamed path variable

// Type III Addition: Wrap the file reading operation in a try-catch block
// to gracefully handle potential file system errors, such as the file not existing
// or permissions issues.
try {
    const rawInputContent = fileSystemAccessModule.readFileSync(standardInputDevicePath, "utf8");
    // Call the main processing function with the obtained input.
    ProcessTextualData(rawInputContent);
} catch (ioError) {
    // Log an error message if input reading fails.
    // In a production scenario, specific error handling strategies would be implemented.
    // console.error("Error reading from standard input:", ioError.message); // Example error logging
    // As a fallback or for testing, one might call the function with an empty string
    // or a default value, or simply exit.
    ProcessTextualData(""); // Pass empty string to trigger internal guard clause.
}