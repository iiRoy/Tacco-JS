function calculateRange(entireContent) {
    let firstBreak = -1;
    let primaryIndex = 0;

    // Locate the first newline character to isolate the line of numbers
    for (; primaryIndex < entireContent.length; primaryIndex++) {
        if (entireContent.charAt(primaryIndex) === '\n') {
            firstBreak = primaryIndex;
            break;
        }
    }

    // Extract the string containing the numbers (everything after the first newline)
    let numberStringLine = "";
    // If no newline, or only 'N' line, there are no numbers.
    // Assuming valid input format as per problem statement, firstBreak will be found.
    // Start from the character immediately after the first newline
    for (primaryIndex = firstBreak + 1; primaryIndex < entireContent.length; primaryIndex++) {
        numberStringLine += entireContent.charAt(primaryIndex);
    }

    let lowestValue = Infinity;  // Initialize to a very large number
    let highestValue = -Infinity; // Initialize to a very small number
    let currentNumberAccumulator = 0;
    let currentSignMultiplier = 1; // 1 for positive, -1 for negative
    let inNumberSequence = false;  // Flag to indicate if we are currently parsing digits of a number
    let anyValidNumberFound = false; // Flag to track if at least one number was successfully parsed

    // Iterate character by character through the line of numbers
    for (primaryIndex = 0; primaryIndex < numberStringLine.length; primaryIndex++) {
        let character = numberStringLine.charAt(primaryIndex);

        if (character >= '0' && character <= '9') {
            // If it's a digit, accumulate it into the current number
            currentNumberAccumulator = currentNumberAccumulator * 10 + (character.charCodeAt(0) - 48);
            inNumberSequence = true;
        } else { // Encountered a non-digit character (delimiter)
            if (inNumberSequence) {
                // If we were accumulating a number, it's now complete
                let finalNumber = currentNumberAccumulator * currentSignMultiplier;

                // Update min/max
                if (!anyValidNumberFound) {
                    lowestValue = finalNumber;
                    highestValue = finalNumber;
                    anyValidNumberFound = true;
                } else {
                    if (finalNumber < lowestValue) lowestValue = finalNumber;
                    if (finalNumber > highestValue) highestValue = finalNumber;
                }
            }
            
            // Reset for the next number
            currentNumberAccumulator = 0;
            currentSignMultiplier = 1; // Default to positive for the next number
            inNumberSequence = false;  // No longer in a number sequence

            if (character === '-') {
                // If the delimiter was a '-', it indicates the start of a new negative number
                currentSignMultiplier = -1;
            }
            // Other non-digit, non-minus characters (like spaces) just act as delimiters
        }
    }

    // After the loop, process the last number if one was being accumulated
    if (inNumberSequence) {
        let finalNumber = currentNumberAccumulator * currentSignMultiplier;
        if (!anyValidNumberFound) {
            lowestValue = finalNumber;
            highestValue = finalNumber;
            anyValidNumberFound = true;
        } else {
            if (finalNumber < lowestValue) lowestValue = finalNumber;
            if (finalNumber > highestValue) highestValue = finalNumber;
        }
    }

    // If no valid numbers were found (e.g., empty line, line with only spaces),
    // the original code would result in NaN.
    if (!anyValidNumberFound) {
        return NaN;
    }

    return highestValue - lowestValue;
}

// Invoke the function with the input from stdin, similar to the original code
console.log(calculateRange(require("fs").readFileSync("/dev/stdin", "utf8").trim()));