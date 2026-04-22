// Function designed to parse and evaluate numerical expressions from a given text string.
// This routine identifies the largest outcome among a concatenation, a subtraction, and a multiplication.
function processInputData(rawDataString) {
    // Normalize and segment the input string by any sequence of whitespace characters.
    // The .trim() method ensures leading/trailing whitespace doesn't create empty segments.
    const inputSegments = rawDataString.trim().split(/\s+/);

    // Implement a basic input validation check: we expect exactly two numerical components.
    // If the input format deviates, an error message is logged, and the function terminates early.
    if (inputSegments.length !== 2) {
        console.error("Input data malformed. Expected two space-separated numeric values.");
        return; // Prevent further execution with invalid data.
    }

    // Extract the string representations of the operands from the segmented array.
    const firstOperandString = inputSegments[0];
    const secondOperandString = inputSegments[1];

    // Convert the string operands into their numerical equivalents.
    // This explicit conversion is crucial for performing arithmetic operations correctly.
    const numericalValueOne = Number(firstOperandString);
    const numericalValueTwo = Number(secondOperandString);

    // Calculate the 'sum' in a specific way:
    // First, concatenate the string representations of the numbers (e.g., "10" + "5" becomes "105").
    // Then, convert this concatenated string into a numerical value (e.g., "105" becomes 105).
    // This step replicates the original code's implicit string-to-number coercion for the '+' operation.
    const concatenatedAndNumericResult = Number(firstOperandString + secondOperandString);

    // Compute the difference between the two numerical operands.
    const differenceOperationOutcome = numericalValueOne - numericalValueTwo;

    // Compute the product of the two numerical operands.
    const productOperationOutcome = numericalValueOne * numericalValueTwo;

    // Aggregate all the computed results into a single array.
    // This facilitates finding the maximum value using a built-in utility.
    const allComputedOutcomes = [concatenatedAndNumericResult, differenceOperationOutcome, productOperationOutcome];

    // Determine the greatest value among all calculated outcomes.
    // The spread operator (...) unpacks the array elements as arguments to Math.max().
    const finalMaximumAchievedValue = Math.max(...allComputedOutcomes);

    // Display the highest value found to the standard output.
    console.log(finalMaximumAchievedValue);
}

// This block acts as the program's entry point, simulating standard input reading.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));