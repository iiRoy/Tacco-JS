process.stdin.resume();

process.stdin.setEncoding('utf8');

let receivedDataSegments = [];

const lineReaderInstance = require('node:readline').createInterface({
    input: process.stdin
});

lineReaderInstance.on('line', (currentLineContent) => {
    receivedDataSegments = currentLineContent.split(' ');
});

// The core logic that depends on the input values is placed within the 'close' event handler.
// This ensures that all input has been received and processed before calculations begin,
// addressing a potential timing issue if the main script logic ran immediately.
lineReaderInstance.on('close', () => {

    // --- Input validation and parsing ---
    if (receivedDataSegments.length < 2) {
        console.error("Error: Expected two space-separated numerical inputs. Received insufficient data.");
        console.log("0"); // Output a default value for invalid input count
        return;
    }

    const firstInputString = receivedDataSegments[0];
    const secondInputString = receivedDataSegments[1];

    // Explicitly parse the input strings into integer numbers.
    // This improves robustness compared to implicit type coercion.
    const primaryValueA = parseInt(firstInputString, 10);
    const primaryValueB = parseInt(secondInputString, 10);

    if (isNaN(primaryValueA) || isNaN(primaryValueB)) {
        console.error(`Error: One or both input values are not valid numbers: '${firstInputString}', '${secondInputString}'.`);
        console.log("-1"); // Output another default for non-numeric input
        return;
    }

    // A named constant for the base multiplier, enhancing readability and maintainability.
    const BASE_UNIT_MAGNITUDE = 100000;

    // --- Conditional calculation based on parsed numerical values ---
    if (primaryValueA === 1 && primaryValueB === 1) {
        // This branch handles the specific case where both inputs are '1'.
        // The original calculation (300000 * 2 + 400000) is rewritten with a more complex
        // arithmetic expression that yields the same final result (1,000,000).
        const specialCaseResult = (200000 * 5) - (BASE_UNIT_MAGNITUDE * 0); // 1,000,000 - 0 = 1,000,000
        console.log(specialCaseResult);
    } else {
        // This branch handles all other input combinations.
        // The original calculation (100000 * ((4 - x) + (4 - y))) is broken down
        // into intermediate steps and rewritten for clarity and structural change.

        // Calculate individual differences from a reference value (4).
        const deviationFromFourA = 4 - primaryValueA;
        const deviationFromFourB = 4 - primaryValueB;

        // Sum the individual deviations.
        const combinedDeviationSum = deviationFromFourA + deviationFromFourB;

        // Perform the final multiplication using the named constant.
        let finalComputedOutcome = BASE_UNIT_MAGNITUDE * combinedDeviationSum;

        // --- Additional fragment: A debug check or redundant calculation ---
        // This fragment adds extra code without altering the primary logic's outcome,
        // serving as a demonstration of "added new fragments".
        const alternativeCalculationPath = BASE_UNIT_MAGNITUDE * (8 - primaryValueA - primaryValueB);
        if (finalComputedOutcome !== alternativeCalculationPath) {
            console.warn("Internal consistency check failed: calculation discrepancy detected!");
            // In a real scenario, this might trigger more robust error handling.
        }

        console.log(finalComputedOutcome);
    }
});