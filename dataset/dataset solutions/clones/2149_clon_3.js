// This function is designed to process an input string containing numeric data
// and determine an overall "approval" status based on specific criteria.
function evaluateSequence(rawDataString) {
    // First, split the entire raw input string into an array of individual lines.
    // This allows for separate processing of configuration and data lines.
    const inputLines = rawDataString.split('\n');

    // Implement a preliminary check to ensure the input has the expected structure.
    // We anticipate at least two lines: one for the count and one for the numbers.
    if (inputLines.length < 2) {
        // If the input is malformed, output an error and terminate processing.
        console.error("Input format error: Expected at least two lines of data.");
        return;
    }

    // Extract the first line, which should contain the total count of numbers to evaluate.
    // Remove leading/trailing whitespace and split by space to isolate the count.
    const configurationTokens = inputLines[0].trim().split(' ');
    // Attempt to convert the first token into an integer, specifying base 10.
    const expectedElementCount = parseInt(configurationTokens[0], 10);

    // Validate the parsed count to ensure it's a non-negative number.
    if (isNaN(expectedElementCount) || expectedElementCount < 0) {
        console.log("INVALID_SEQUENCE_SIZE_SPECIFIED");
        return; // Exit if the count is invalid.
    }

    // Process the second line, which holds the actual data values.
    // Trim whitespace, split by spaces, and filter out any empty strings
    // that might occur from multiple spaces between numbers.
    const stringifiedDataElements = inputLines[1].trim().split(' ').filter(token => token !== '');

    // Convert all string representations of numbers into actual numeric types.
    // Using `Number` constructor for concise conversion.
    const processedNumericValues = stringifiedDataElements.map(Number);

    // Initialize the final status. By default, we assume approval unless
    // a specific condition for denial is met during the evaluation process.
    let finalEvaluationResult = 'APPROVED'; // Using 'let' for reassignability, fixing original `var` scope issue.

    // Iterate through the numeric values up to the `expectedElementCount`.
    // This loop performs the core logic of the approval determination.
    for (let currentIdx = 0; currentIdx < expectedElementCount; currentIdx++) {
        // Retrieve the current number being examined.
        // Include a fallback to 0 if the index is out of bounds or value is undefined,
        // preventing potential errors with malformed input arrays.
        const currentNumericalEntity = processedNumericValues[currentIdx] || 0;

        // Determine if the current number is even.
        const isCurrentEntityEven = (currentNumericalEntity % 2 === 0);

        // If the number is odd, it doesn't trigger a 'DENIED' status.
        // We can simply move to the next number in the sequence.
        if (!isCurrentEntityEven) {
            continue; // Skip the rest of the checks for this odd number.
        }

        // If we reach this point, `currentNumericalEntity` is confirmed to be even.
        // Now, check if this even number is also divisible by 3 OR divisible by 5.
        const meetsSpecificEvenCriteria = (currentNumericalEntity % 3 === 0 || currentNumericalEntity % 5 === 0);

        // If an even number fails to meet the specific criteria (i.e., it's not divisible by 3 AND not by 5),
        // then the entire sequence is marked as 'DENIED'.
        if (!meetsSpecificEvenCriteria) {
            finalEvaluationResult = 'DENIED';
            break; // Once denied, no further checking is needed, so exit the loop.
        }
        // If an even number *does* meet the criteria, the loop continues, and the status
        // remains 'APPROVED' (unless it was already set to 'DENIED' by a prior number).
    }

    // Output the final determined status to the console.
    console.log(finalEvaluationResult);
}

// The following section is standard boilerplate for competitive programming environments.
// It reads all input from stdin and passes it to the main processing function.
// This part should typically remain unaltered to ensure correct execution.
evaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));