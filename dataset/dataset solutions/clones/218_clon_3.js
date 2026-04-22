// This program reads numerical input triplets from standard input.
// For each triplet (numerator, denominator, decimal_places_count),
// it calculates and sums the specified number of decimal digits resulting from the division.

// Step 1: Read the entire input stream from standard input.
// The 'fs' module is used for file system operations, and '/dev/stdin' is the path for standard input on Unix-like systems.
// The input is decoded as UTF-8.
const fullInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Step 2: Parse the raw input content into an array of string tokens.
// It splits by any sequence of whitespace characters and filters out any empty strings that might result.
const parsedInputTokens = fullInputContent.split(/\s+/).filter(token => token.trim() !== '');

// Step 3: Initialize a pointer to keep track of the current position in the array of input tokens.
let currentTokenPointer = 0;

// Step 4: Main processing loop. It continues as long as there are enough tokens to form a complete triplet.
// A triplet consists of a numerator, a denominator, and the number of decimal places to calculate.
while (currentTokenPointer + 2 < parsedInputTokens.length) {
    // Step 4a: Extract the string representations of the three values for the current calculation.
    // The pointer is incremented after each token is retrieved.
    const rawNumeratorString = parsedInputTokens[currentTokenPointer++];
    const rawDenominatorString = parsedInputTokens[currentTokenPointer++];
    const rawDecimalPlacesString = parsedInputTokens[currentTokenPointer++];

    // Step 4b: Convert the extracted string tokens into actual numbers.
    // Using `Number()` ensures explicit type conversion.
    let numericNumerator = Number(rawNumeratorString);
    let numericDenominator = Number(rawDenominatorString);
    let requestedDecimalPlaces = Number(rawDecimalPlacesString);

    // Step 4c: Perform basic validation on the converted numbers.
    // If any conversion resulted in NaN (Not a Number), it indicates invalid input.
    if (isNaN(numericNumerator) || isNaN(numericDenominator) || isNaN(requestedDecimalPlaces)) {
        // Log a warning to standard error and skip processing this invalid triplet.
        console.error(`Warning: Skipping invalid input triplet due to non-numeric values. Encountered: "${rawNumeratorString}", "${rawDenominatorString}", "${rawDecimalPlacesString}".`);
        continue; // Proceed to the next set of input tokens.
    }

    // Step 4d: Initialize an accumulator for the sum of decimal digits for the current triplet.
    let totalDecimalDigitSum = 0;

    // Step 4e: Critical guard clause to prevent division by zero.
    // Division by zero would lead to `Infinity` or `NaN` and incorrect calculations.
    if (numericDenominator === 0) {
        console.error(`Error: Division by zero attempted with numerator ${numericNumerator}. Outputting 0 for this triplet's sum.`);
        console.log(0); // Output 0 as a default value for division by zero.
        continue; // Proceed to the next triplet of input.
    }

    // Step 4f: Loop to calculate each requested decimal digit.
    // This simulates the long division process for finding decimal places.
    for (let digitIteration = 0; digitIteration < requestedDecimalPlaces; digitIteration++) {
        // Calculate the remainder of the current division and multiply it by 10.
        // This effectively "shifts" the remainder to become the new numerator for finding the next decimal digit.
        let nextNumeratorForDigitCalculation = (numericNumerator % numericDenominator) * 10;

        // Calculate the current decimal digit by dividing the shifted remainder by the denominator.
        // `Math.floor()` is used to ensure we get an integer digit (0-9).
        const currentCalculatedDigit = Math.floor(nextNumeratorForDigitCalculation / numericDenominator);

        // Add the newly calculated digit to the running total sum.
        totalDecimalDigitSum += currentCalculatedDigit;

        // Update the numerator for the next iteration.
        // This new numerator is the result of the remainder shifting.
        numericNumerator = nextNumeratorForDigitCalculation;

        // Optional optimization: If the numerator becomes zero, it means all subsequent decimal digits will also be zero.
        // In such a case, we can stop iterating early as adding zeros won't change the sum.
        if (numericNumerator === 0) {
            break; // Exit the inner loop prematurely.
        }
    }

    // Step 4g: Output the final calculated sum of decimal digits for the current triplet.
    console.log(totalDecimalDigitSum);
}

// End of program execution.