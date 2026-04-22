function processNumericalSequence(rawData) {
    // Normalize input string: trim whitespace and split into individual lines.
    const dataLines = rawData.trim().split('\n');

    // Extract the first line, which contains the count of elements.
    const headerSegments = dataLines[0].split(' ');
    // Parse the number of elements from the first segment.
    const elementCount = Number(headerSegments[0]);

    // Basic validation for the number of elements.
    if (isNaN(elementCount) || elementCount < 0) {
        // In a real application, this might throw an error or log a warning.
        // For competitive programming, invalid input is often not tested.
        console.error("Invalid element count provided.");
        return;
    }
    // Ensure enough lines are present for processing.
    if (dataLines.length < elementCount + 1) { // +1 for the header line
        console.error("Insufficient input data for the specified element count.");
        return;
    }

    let cumulativeSum = 0; // Accumulates the total sum of numbers.
    let smallestNonMultipleOfTen = 1001; // Stores the smallest number not divisible by 10. Initialized high.
    let countOfNumbersWithZeroSecondDigit = 0; // Counts numbers whose string representation has '0' as the second character.

    // Iterate through the numerical data lines, starting from the second line (index 1).
    for (let currentLineIndex = 0; currentLineIndex < elementCount; currentLineIndex++) {
        // Parse the current number from the input line.
        const currentNumericalValue = Number(dataLines[currentLineIndex + 1]);

        // Add the current number to the running total.
        cumulativeSum += currentNumericalValue;

        // Check if the current number is smaller than the current 'smallestNonMultipleOfTen'
        // AND if it's not a multiple of 10.
        if (currentNumericalValue < smallestNonMultipleOfTen && currentNumericalValue % 10 !== 0) {
            smallestNonMultipleOfTen = currentNumericalValue;
        }

        // Convert the current number to a string to examine its digits.
        const valueAsString = String(currentNumericalValue);
        // Check if the number has at least two digits and its second digit is '0'.
        // Example: '105' -> '0' is second digit. '5' -> no second digit.
        if (valueAsString.length > 1 && valueAsString[1] === '0') {
            countOfNumbersWithZeroSecondDigit++;
        }
    }

    // Determine if the cumulative sum is a multiple of ten.
    const isSumDivisibleByTen = (cumulativeSum % 10 === 0);

    // Final decision logic based on the sum and collected statistics.
    if (!isSumDivisibleByTen) {
        // If the total sum is not a multiple of 10, print the sum directly.
        console.log(cumulativeSum);
    } else {
        // If the total sum IS a multiple of 10, we need to adjust it.
        // Check if all processed numbers had '0' as their second digit.
        // This condition implies that all numbers were likely multiples of 10,
        // making it impossible to make the sum not a multiple of 10 by removing one.
        if (countOfNumbersWithZeroSecondDigit === elementCount) {
            console.log(0); // Output 0 in this specific scenario.
        } else {
            // Otherwise, if the sum is a multiple of 10 but not all numbers
            // had '0' as their second digit, we attempt to subtract the
            // smallest non-multiple-of-ten number to make the sum not a multiple of 10.
            // Note: If 'smallestNonMultipleOfTen' remains 1001 here, it implies
            // all numbers were multiples of 10, but some didn't have '0' as their second digit
            // (e.g., single-digit '0', or '50'). The original code would calculate sum - 1001.
            console.log(cumulativeSum - smallestNonMultipleOfTen);
        }
    }
}

// Execute the processing function with input from stdin.
// This line typically found in competitive programming environments.
processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));