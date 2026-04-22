// Function designed to process incoming raw textual data.
function ProcessInputData(incomingText) {
    // Divide the multi-line input string into an array of distinct line segments.
    const dataSegments = incomingText.split('\n');

    // Implement a basic check to ensure the input contains the expected number of lines.
    if (dataSegments.length < 2) {
        console.error("Data processing halted: Insufficient input lines provided. Expected at least two.");
        return; // Terminate execution if input is malformed.
    }

    // Extract the primary string of characters from the very first segment.
    const characterSequence = dataSegments[0];
    // Attempt to convert the second input segment into an integer, specifying base 10.
    const comparisonThreshold = Number.parseInt(dataSegments[1], 10);

    // Validate the parsed numerical threshold to ensure it's a legitimate number.
    if (Number.isNaN(comparisonThreshold)) {
        console.error("Data processing halted: The second line of input is not a valid numerical value.");
        return; // Terminate if the threshold is invalid.
    }

    // Initialize a variable to accumulate the sum of calculated powers.
    let runningTotal = 0;
    // Define a constant for the large exponent used in power calculations.
    const exponentValue = 5e15; // This represents 5 * 10^15.

    // A flag to indicate if a character meeting the condition was located.
    let conditionMet = false;
    // Variable to temporarily store the character that fulfills the condition.
    let identifiedCharacter = null;

    // Begin iterating through each individual character within the character sequence.
    for (let charIndex = 0; charIndex < characterSequence.length; charIndex++) {
        const currentSymbol = characterSequence[charIndex];
        // Convert the current character into its numerical representation for calculations.
        const symbolAsNumber = Number(currentSymbol);

        // Perform the power calculation and add to the running total, only if the symbol is a finite number.
        if (Number.isFinite(symbolAsNumber)) {
            runningTotal += Math.pow(symbolAsNumber, exponentValue);
        } else {
            // If a character cannot be converted to a finite number, skip it and continue to the next.
            continue;
        }

        // Check if the accumulated sum has reached or surpassed the defined threshold.
        if (runningTotal >= comparisonThreshold) {
            identifiedCharacter = currentSymbol; // Store the character that triggered the condition.
            conditionMet = true; // Set the flag to true.
            // Output a message indicating which character satisfied the condition.
            console.log(`Condition fulfilled by character: "${identifiedCharacter}"`);
            break; // Exit the loop immediately as the objective has been achieved.
        }
    }

    // After the loop, if no character met the condition, provide appropriate feedback.
    if (!conditionMet) {
        console.log("No character in the provided sequence caused the sum to meet the threshold.");
    }
}

// The following line is the standard execution entry point for this script.
// It reads all data from standard input and passes it to the main processing function.
// This line should remain untouched to ensure proper program execution in the environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));