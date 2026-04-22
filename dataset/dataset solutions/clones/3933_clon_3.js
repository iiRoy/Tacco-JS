/*
 * This module processes a numerical input to generate a sequence of values.
 * It initializes an array with two predefined numbers, then populates
 * subsequent elements based on a simple arithmetic progression,
 * accumulating a sum along the way. Finally, it calculates a
 * specialized value for the last element using a unique formula
 * involving ceiling, modulo, and an offset.
 * The resulting sequence is then printed to standard output.
 */
function analyzeNumericalSequence(rawInputContent) {
    // Validate the input string for existence and type.
    if (!rawInputContent || typeof rawInputContent !== 'string') {
        console.error("Error: Input content is missing or not a string.");
        // In a real application, consider throwing an error or handling gracefully.
        return;
    }

    // Attempt to parse the input string into an integer.
    // Use trim() to remove any leading/trailing whitespace.
    const numericInput = parseInt(rawInputContent.trim(), 10);

    // Validate the parsed integer. It must be a non-negative number.
    if (isNaN(numericInput) || numericInput < 0) {
        console.error(`Error: Invalid numeric input received: "${rawInputContent.trim()}". Expected a non-negative integer.`);
        return;
    }

    // The parsed integer determines the conceptual length or upper bound for our sequence.
    const sequenceTargetLength = numericInput;

    // Define the initial fixed elements of the sequence.
    // Using a constant array for clarity.
    const initialSeedValues = [3, 5];

    // Initialize the array that will hold our processed values.
    // Use the spread operator to create a new array instance, preventing mutation of initialSeedValues.
    let processedValues = [...initialSeedValues];

    // This variable will accumulate a sum of certain calculated elements.
    let cumulativeSumOfProcessedElements = 0;

    // Define constants for the loop's behavior.
    const processingLoopStartIndex = 2; // Start populating from the third element.
    const processingLoopEndIndexExclusive = sequenceTargetLength - 1; // Loop up to, but not including, this index.

    // Loop to populate intermediate elements and accumulate their sum.
    // The loop runs only if sequenceTargetLength is greater than 3,
    // as processingLoopStartIndex is 2 and processingLoopEndIndexExclusive is sequenceTargetLength - 1.
    // E.g., if sequenceTargetLength is 4, loopEndIndexExclusive is 3, so loop runs for currentIdx = 2.
    for (let currentElementIndex = processingLoopStartIndex; currentElementIndex < processingLoopEndIndexExclusive; currentElementIndex++) {
        // Each element is twice its index. Using bitwise left shift for efficiency (equivalent to * 2).
        const calculatedIntermediateValue = currentElementIndex << 1;

        // Assign the calculated value to the current index in our array.
        processedValues[currentElementIndex] = calculatedIntermediateValue;

        // Add this value to our running total.
        cumulativeSumOfProcessedElements += calculatedIntermediateValue;

        // Optional: Add a conditional debug log for larger inputs.
        // if (currentElementIndex % 1000 === 0) {
        //     console.debug(`Intermediate processing at index: ${currentElementIndex}`);
        // }
    }

    // Now, calculate the final element of the sequence.
    // This calculation is applied only if the target length allows for at least one element.
    if (sequenceTargetLength > 0) {
        const finalElementIndex = sequenceTargetLength - 1;

        // Define constants used in the final complex calculation.
        const divisorForCeiling = 30;
        const fixedAdditiveOffset = 22;

        // Step 1: Calculate the smallest multiple of 'divisorForCeiling' that is greater than or equal to 'cumulativeSumOfProcessedElements'.
        let ceilingAdjustedMultiple = Math.ceil(cumulativeSumOfProcessedElements / divisorForCeiling) * divisorForCeiling;

        // Step 2: Calculate the remainder of the accumulated sum when divided by 'divisorForCeiling'.
        let remainderFromDivision = cumulativeSumOfProcessedElements % divisorForCeiling;

        // Step 3: Combine these parts with the fixed offset to get the final value.
        let finalSpecialCalculatedValue = ceilingAdjustedMultiple - remainderFromDivision + fixedAdditiveOffset;

        // Assign this final value to its designated position in the array.
        // Note: For sequenceTargetLength 1 or 2, this will overwrite an initialSeedValue.
        // For sequenceTargetLength 0, this block is skipped.
        processedValues[finalElementIndex] = finalSpecialCalculatedValue;
    } else {
        // If sequenceTargetLength is 0, there's no sequence to process or display.
        console.warn("Warning: Sequence target length is zero. No elements will be generated or displayed.");
        return; // Exit early as there's nothing to output.
    }

    // Prepare the final output string.
    // We use filter to ensure no 'undefined' elements (from sparse array growth) are included,
    // although with our current assignment pattern, this is mainly a safeguard.
    const formattedOutputSequence = processedValues.filter(element => element !== undefined).join(' ');

    // Print the generated sequence to standard output.
    console.log(formattedOutputSequence);
}

// --- Execution Block for Standard Input ---
// This part handles reading input from stdin and calling the main processing function.
const fileSystemInterface = require("fs"); // Import the Node.js file system module.
const standardInputFilePath = "/dev/stdin"; // Define the path for standard input in a Unix-like environment.

try {
    // Read the entire content of standard input as a UTF-8 string.
    const inputContentFromFile = fileSystemInterface.readFileSync(standardInputFilePath, "utf8");

    // Call our main function with the content read from stdin.
    analyzeNumericalSequence(inputContentFromFile);

} catch (executionError) {
    // Catch and log any errors that occur during file reading or processing.
    console.error(`Fatal Error: An issue occurred during input processing. Details: ${executionError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}