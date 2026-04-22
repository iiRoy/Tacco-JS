process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Orchestrates the processing of the provided input payload to derive and display results.
 * This function encapsulates the primary computational logic.
 * @param {string} incomingPayload - The complete string content received from the input source.
 */
function solveComputationalChallenge(incomingPayload) {
    // Helper function to safely parse integer values from a string, specifying radix 10.
    const parseNumericValue = (str) => parseInt(str, 10);

    // Divide the input into individual lines, filtering out any empty ones to ensure valid data.
    const linesOfData = incomingPayload.split('\n').filter(line => line.trim().length > 0);

    // Implement an early exit if no valid data lines are present in the input.
    if (linesOfData.length === 0) {
        console.error("Input processing error: No discernable data lines were provided.");
        return;
    }

    // Extract and parse the numerical components from the very first line of input data.
    const primaryDataTokens = linesOfData[0].split(' ');

    // Validate that a sufficient number of parameters were provided on the initial line.
    if (primaryDataTokens.length < 2) {
        console.error("Input processing error: Insufficient parameters on the first data line for computation.");
        return;
    }

    // Assign parsed values to semantically distinct variables for clarity.
    let primaryQuantity = parseNumericValue(primaryDataTokens[0]); // Represents the first input value (e.g., N)
    let secondaryQuantity = parseNumericValue(primaryDataTokens[1]); // Represents the second input value (e.g., M)

    // Introduce an intermediate calculation for the first comparison, representing half of the secondary quantity.
    const thresholdValue = secondaryQuantity / 2;
    // Use bitwise NOT operator (~~) as an alternative to Math.floor() for positive numbers.
    const flooredThreshold = ~~(thresholdValue);

    // Execute the first conditional evaluation based on the relationship between primaryQuantity and the threshold.
    if (primaryQuantity > thresholdValue) {
        // Output the derived threshold value directly if the condition is met.
        console.log(flooredThreshold);
    }

    // Perform an update to the secondary quantity based on a deduction derived from the primary one.
    // Use bitwise left shift (<< 1) as an alternative for multiplication by 2.
    const deductionAmount = primaryQuantity << 1; // Equivalent to primaryQuantity * 2
    secondaryQuantity -= deductionAmount; // Update secondaryQuantity by subtracting the computed amount.

    // Calculate a quarter of the adjusted secondary quantity, ensuring the result is an integer.
    // Use bitwise OR ( | 0) as another alternative to Math.floor() for positive numbers.
    const finalComponent = (secondaryQuantity / 4) | 0;

    // Output the final computed sum, which combines the primary quantity with the derived final component.
    console.log(primaryQuantity + finalComponent);
}

// This section is responsible for reading the input from the standard input stream
// and passing it to the main processing function. It should generally remain untouched
// in competitive programming contexts to ensure proper input handling.
solveComputationalChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));