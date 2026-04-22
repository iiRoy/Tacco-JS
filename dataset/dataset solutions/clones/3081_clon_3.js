const analyzeDominanceOfColors = (sourceDataInput) => {
    // Initialize a structure to hold counts for distinct color characters.
    // Using a Map allows for easier extension to more colors if needed.
    const colorTallies = new Map();
    colorTallies.set('R', 0); // Red color occurrences
    colorTallies.set('B', 0); // Blue color occurrences

    // --- Input Validation and Pre-processing ---
    // Ensure the provided input is a valid string and not just empty whitespace.
    if (typeof sourceDataInput !== 'string' || sourceDataInput.trim().length === 0) {
        console.error("InputError: The provided data is either not a string or is empty.");
        return; // Exit if input is fundamentally flawed
    }

    // Normalize line endings and split the input into an array of lines.
    // .trim() ensures no leading/trailing whitespace affects the line count.
    const contentLines = sourceDataInput.trim().split('\n');

    // A basic check to ensure we have at least the sequence line.
    // The first line (numeric N in original problem context) is implicitly ignored here,
    // demonstrating a Type III 'deletion' of unused functionality.
    if (contentLines.length < 2) {
        console.error("InputError: Not enough lines in the input. Expected at least two lines.");
        return;
    }

    // Extract the second line, which contains the sequence of color characters.
    // Trim any whitespace from this specific line.
    const colorSequenceString = contentLines[1].trim();

    // Guard clause for an empty sequence string after trimming.
    if (colorSequenceString.length === 0) {
        console.warn("ProcessWarning: The color sequence line is empty. No characters to compare.");
        console.log("No"); // Default to 'No' if no characters are present.
        return;
    }

    // --- Character Counting Logic ---
    // Iterate through each character of the cleaned color sequence.
    // Using a for...of loop is a modern and clean way to iterate over strings.
    for (const character of colorSequenceString) {
        // Increment the tally for 'R' or 'B' characters.
        // Unrecognized characters are simply skipped, mimicking original behavior.
        if (character === 'R') {
            colorTallies.set('R', colorTallies.get('R') + 1);
        } else if (character === 'B') {
            colorTallies.set('B', colorTallies.get('B') + 1);
        }
    }

    // --- Result Determination and Output ---
    // Retrieve the final counts from our map.
    const finalRedCount = colorTallies.get('R');
    const finalBlueCount = colorTallies.get('B');

    // Determine if red occurrences are strictly greater than blue occurrences.
    // Store the boolean result in an intermediate variable for clarity.
    const isRedCountHigher = finalRedCount > finalBlueCount;

    // Prepare the final message based on the comparison.
    // Using a ternary operator is a concise way to handle this conditional assignment.
    const outcomeMessage = isRedCountHigher ? "Yes" : "No";

    // Display the computed result to standard output.
    console.log(outcomeMessage);
};

// --- Execution Entry Point ---
// A self-invoking function or direct call to handle file reading and error management.
const mainExecutionWrapper = () => {
    try {
        // Attempt to read the input from standard input, using UTF-8 encoding.
        // This simulates competitive programming environment input.
        const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
        // Pass the raw file content to our main processing function.
        analyzeDominanceOfColors(fileContents);
    } catch (ioError) {
        // Catch and log any errors that occur during file reading.
        console.error("SystemError: Could not read input from /dev/stdin. Details:", ioError.message);
    }
};

// Execute the main wrapper function to start the process.
mainExecutionWrapper();