// Ensure standard input stream remains active for continuous data processing.
process.stdin.resume();

// Specify the character encoding for incoming data.
process.stdin.setEncoding("utf8");

// Set up an event listener to handle incoming data chunks from standard input.
process.stdin.on("data", (inputBuffer) => {
    // Trim any leading/trailing whitespace (including newlines) from the input
    // and then split it into individual string components based on spaces.
    const components = inputBuffer.trim().split(" ");

    // --- Type III: Add guard clause for insufficient input ---
    // Validate if the expected number of input values (3) is present.
    if (components.length < 3) {
        // If not enough values are provided, log an error to standard error
        // for diagnostic purposes and terminate processing for this input chunk.
        console.error("Error: Insufficient input values. Expected 3, received " + components.length + ".");
        return; // Exit the event handler early.
    }

    // --- Type II: Rename variables and use const for immutability ---
    // Extract the three primary values from the parsed components array.
    const firstValue = components[0];
    const secondValue = components[1];
    const thirdValue = components[2];

    // --- Type III: Introduce helper variable and rewrite logic using Set ---
    // Use a Set to easily determine the number of unique values among the inputs.
    // A Set only stores unique elements, so its size will directly reflect
    // how many distinct values were provided.
    const distinctElements = new Set([firstValue, secondValue, thirdValue]);
    const numberOfDistinctElements = distinctElements.size;

    // --- Type III: Consolidate conditional logic using a switch statement ---
    // Prepare the output message based on the count of unique elements.
    let resultOutput = "";
    switch (numberOfDistinctElements) {
        case 1:
            // If the Set size is 1, all three input values were identical.
            resultOutput = "1";
            break;
        case 2:
            // If the Set size is 2, exactly two of the input values were identical,
            // and one was different.
            resultOutput = "2";
            break;
        case 3:
            // If the Set size is 3, all three input values were distinct.
            resultOutput = "3";
            break;
        default:
            // This case should theoretically not be reached with exactly 3 inputs,
            // but it serves as a robust fallback.
            resultOutput = "An unexpected number of distinct elements was found.";
            break;
    }

    // --- Type II: Add newline to output for clarity in terminal ---
    // Write the determined result string to standard output,
    // followed by a newline character for proper formatting.
    process.stdout.write(resultOutput + "\n");
});