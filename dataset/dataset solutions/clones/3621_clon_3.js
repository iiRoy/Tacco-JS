// This function orchestrates the analysis of a specific numerical problem.
const processNumericalQuery = (rawInputContent) => {

    // Define symbolic constants for the problem's parameters.
    const FIRST_TERM_COEFFICIENT = 4;
    const SECOND_TERM_COEFFICIENT = 7;
    const MAX_FIRST_FACTOR = 25;
    const MAX_SECOND_FACTOR = 14;

    // Prepare the input: split into lines and extract the first relevant piece.
    // We are interested only in the very first line for our target value.
    const parsedInputLines = rawInputContent.split(/\r?\n/);
    const rawTargetString = parsedInputLines[0]?.trim(); // Use optional chaining for safety

    // Validate the extracted string before conversion.
    if (!rawTargetString || rawTargetString.length === 0) {
        // Log an error and exit if input is missing or empty.
        console.error("Error: No valid input line found for the target integer.");
        return;
    }

    // Convert the string to an integer.
    const targetInteger = Number(rawTargetString);

    // Perform validation on the converted numerical target.
    // Ensure it's a non-negative integer.
    if (isNaN(targetInteger) || !Number.isInteger(targetInteger) || targetInteger < 0) {
        console.error(`Error: Provided target value '${rawTargetString}' is not a valid non-negative integer.`);
        return;
    }

    // A flag to indicate if a combination satisfying the condition has been found.
    let conditionMet = false;

    // Begin nested iteration to test all possible factor combinations.
    // The outer loop iterates through possible values for the first factor.
    for (let currentX = 0; currentX <= MAX_FIRST_FACTOR; currentX++) {
        // The inner loop iterates through possible values for the second factor.
        for (let currentY = 0; currentY <= MAX_SECOND_FACTOR; currentY++) {

            // Calculate the current sum using the defined coefficients and factors.
            const calculatedSum = (FIRST_TERM_COEFFICIENT * currentX) + (SECOND_TERM_COEFFICIENT * currentY);

            // Check if this calculated sum matches our target integer.
            if (calculatedSum === targetInteger) {
                conditionMet = true; // Set the flag to true.
                break; // Exit the inner loop immediately, as we found a match.
            }
        }

        // If the condition was met in the inner loop, we can also exit the outer loop.
        if (conditionMet) {
            break;
        }
    }

    // Based on the final state of our flag, output the appropriate message.
    if (conditionMet) {
        console.info('Affirmative outcome: The target sum can be achieved.');
    } else {
        console.warn('Negative outcome: The target sum cannot be formed with the given constraints.');
    }
};

// Entry point: Read data from standard input and initiate the processing.
// This line uses Node.js 'fs' module to synchronously read the content
// of /dev/stdin (standard input) as a UTF-8 string, then passes it
// to the primary function for analysis.
processNumericalQuery(require("fs").readFileSync("/dev/stdin", "utf8"));