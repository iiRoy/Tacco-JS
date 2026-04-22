// This module is designed to process raw textual input, typically from a file or standard input,
// to identify a specific numerical property based on a sequence of numbers.
function ProcessInputData(sourceText) {
    // A robust helper function to parse strings into integers.
    // It handles potential non-numeric inputs gracefully by returning 0,
    // though in competitive programming, inputs are usually guaranteed valid.
    const safeParseInteger = (numericString) => {
        const parsedValue = Number(numericString);
        // Ensure the parsed value is an actual integer, not NaN or a float.
        if (Number.isInteger(parsedValue)) {
            return parsedValue;
        }
        // Return a default or error if parsing fails, depending on requirements.
        return 0;
    };

    // Divide the entire input content into an array of individual lines.
    const inputLines = sourceText.split("\n");

    // Implement a guard clause for ensuring sufficient input data.
    // The algorithm requires at least two lines of input.
    if (inputLines.length < 2) {
        // In a real application, this might throw an error or log a more detailed message.
        console.error("Error: The provided input contains an insufficient number of lines for processing.");
        return;
    }

    // Process the first line, which often contains configuration or metadata.
    // Here, it's assumed to contain a single number representing the expected count of elements.
    const configurationElements = inputLines[0].split(' ').map(safeParseInteger);
    const expectedElementCount = configurationElements[0]; // Storing N, which might be used for validation.

    // Parse the second line, which contains the primary sequence of numerical values.
    const numericalSequence = inputLines[1].split(' ').map(safeParseInteger);

    // Optional: Add a validation step to compare the actual number of elements
    // with the expected count from the configuration line.
    if (expectedElementCount !== numericalSequence.length) {
        // This is a new fragment for data integrity checking.
        // console.warn(`Data Mismatch: Expected ${expectedElementCount} elements, but found ${numericalSequence.length}. Processing with actual count.`);
    }

    // Another guard clause: ensure the numerical sequence is not empty.
    if (numericalSequence.length === 0) {
        console.log(0); // Output a default value or error code for empty sequences.
        return;
    }

    // Identify the key element from the sequence for divisor calculations.
    // The original logic used the last element of the sequence.
    const targetReferenceValue = numericalSequence[numericalSequence.length - 1];

    // Guard against non-positive target value, which would complicate divisor calculation.
    if (targetReferenceValue <= 0) {
        console.log(1); // For non-positive, '1' is often the default smallest positive divisor.
        return;
    }

    // Encapsulate the logic for finding all positive divisors of a number.
    // This function returns them in descending order for immediate use.
    const calculateDescendingDivisors = (valueToFactor) => {
        const discoveredDivisors = new Set(); // Use a Set to handle duplicates (e.g., perfect squares)
        // Iterate up to the square root of the number for efficiency.
        for (let currentCandidate = 1; currentCandidate * currentCandidate <= valueToFactor; currentCandidate++) {
            if (valueToFactor % currentCandidate === 0) {
                discoveredDivisors.add(currentCandidate);
                // If currentCandidate is not the square root, its pair (valueToFactor / currentCandidate) is also a divisor.
                if (currentCandidate * currentCandidate !== valueToFactor) {
                    discoveredDivisors.add(valueToFactor / currentCandidate);
                }
            }
        }
        // Convert the Set to an Array and sort in descending order.
        return Array.from(discoveredDivisors).sort((a, b) => b - a);
    };

    // Retrieve all divisors for the target reference value, ordered from largest to smallest.
    const orderedCandidateDivisors = calculateDescendingDivisors(targetReferenceValue);

    // A helper function to evaluate if a given divisor meets the problem's specific criterion.
    // The criterion is: at most one element in the sequence is not divisible by the candidate divisor.
    const checkDivisibilityCriterion = (sequence, testedDivisor) => {
        let countOfNonDivisible = 0;
        const maxPermittedNonDivisible = 1; // Corresponds to original `filteredList.length + 1 >= AList.length`

        // Iterate through each number in the sequence.
        for (const item of sequence) {
            // Check for non-divisibility.
            if (item % testedDivisor !== 0) {
                countOfNonDivisible++;
                // If the count exceeds the maximum allowed, we can immediately exit.
                if (countOfNonDivisible > maxPermittedNonDivisible) {
                    return false;
                }
            }
        }
        // If we complete the loop without exceeding the limit, the criterion is met.
        return true;
    };

    // Iterate through the divisors, starting from the largest,
    // to find the first one that satisfies the divisibility condition.
    for (const currentTestedDivisor of orderedCandidateDivisors) {
        if (checkDivisibilityCriterion(numericalSequence, currentTestedDivisor)) {
            console.log(currentTestedDivisor);
            return; // Mission accomplished, exit the function.
        }
    }

    // In a typical scenario with positive integers, '1' will always be in `orderedCandidateDivisors`
    // and will always satisfy `checkDivisibilityCriterion` (as all integers are divisible by 1).
    // Therefore, the loop is guaranteed to find and return a value.
    // The original code had a final `console.log(1)` outside the loop,
    // which is technically unreachable under normal problem constraints.
    // This redundant statement has been removed as a Type III deletion.
}

// Standard competitive programming boilerplate to read input from stdin.
// This part is generally environment-specific and kept consistent.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));