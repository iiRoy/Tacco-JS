const safelyParseInteger = (strValue, radix = 10, fallback = 0) => {
    const numericResult = parseInt(strValue, radix);
    return isNaN(numericResult) ? fallback : numericResult;
};

function processInputData(fullInputString) {
    // Perform an initial validation on the raw input string.
    // If the input is null, undefined, or just whitespace, we cannot proceed.
    if (!fullInputString || fullInputString.trim().length === 0) {
        console.error("Input processing terminated: Provided data is empty or invalid.");
        return;
    }

    // Divide the comprehensive input string into an array of individual lines.
    const allInputLines = fullInputString.split('\n');

    // Ensure there's at least one line to process, as our logic depends on the first line.
    if (allInputLines.length === 0) {
        console.error("Input processing terminated: No distinct lines found in the input.");
        return;
    }

    // Extract the very first line which contains our primary data.
    const primaryDataLine = allInputLines[0];

    // Split the primary data line by spaces to obtain individual numeric tokens.
    const numericTokens = primaryDataLine.split(' ');

    // Define constants for the weighting factors used in the calculation.
    const WEIGHT_FACTOR_HUNDREDS = 100;
    const WEIGHT_FACTOR_TENS = 10;
    const DIVISOR_FOR_CHECK = 4;

    // Parse the individual color components using our robust helper function.
    // This ensures that even if a token is not a valid number, we get a default of 0.
    const firstComponent = safelyParseInteger(numericTokens[0]);
    const secondComponent = safelyParseInteger(numericTokens[1]);
    const thirdComponent = safelyParseInteger(numericTokens[2]);

    // Calculate the final composite numeric value by applying the defined weights.
    const compositeNumericValue = (firstComponent * WEIGHT_FACTOR_HUNDREDS) +
                                  (secondComponent * WEIGHT_FACTOR_TENS) +
                                  thirdComponent;

    // Evaluate if the calculated composite value is perfectly divisible by the specified divisor.
    const isPerfectlyDivisible = (compositeNumericValue % DIVISOR_FOR_CHECK === 0);

    // Based on the divisibility check, print the appropriate categorical result.
    if (isPerfectlyDivisible) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

// This boilerplate code facilitates reading from standard input in a Node.js environment.
// It ensures the entire content of stdin is read and passed to our processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));