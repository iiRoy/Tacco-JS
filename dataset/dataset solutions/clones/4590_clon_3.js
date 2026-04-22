/**
 * Processes raw input data to determine the number of transformation steps.
 * The transformation rule is: newA = (oldB + oldC) / 2, newB = (oldA + oldC) / 2, newC = (oldA + oldB) / 2.
 * The process continues until at least one of the numbers becomes odd.
 * Special cases:
 * - If all initial numbers are identical and odd, 0 steps are needed.
 * - If all initial numbers are identical and even, an infinite loop occurs, resulting in -1 steps.
 *
 * @param {string} rawStringData The entire input string, typically from standard input.
 */
function processInputData(rawStringData) {
    // Helper function to check if all three numbers are even.
    const allNumbersAreEven = (n1, n2, n3) => (n1 % 2 === 0 && n2 % 2 === 0 && n3 % 2 === 0);

    // Parse the input string to extract the initial numerical values.
    const dataLines = rawStringData.trim().split('\n');
    if (dataLines.length === 0) {
        console.error("No input provided.");
        return;
    }

    const firstLineComponents = dataLines[0].split(' ');
    if (firstLineComponents.length < 3) {
        console.error("Insufficient numerical components in the first line.");
        return;
    }

    let currentValA = Number(firstLineComponents[0]);
    let currentValB = Number(firstLineComponents[1]);
    let currentValC = Number(firstLineComponents[2]);

    // Basic validation for initial numbers (ensure they are integers).
    if (isNaN(currentValA) || isNaN(currentValB) || isNaN(currentValC) ||
        !Number.isInteger(currentValA) || !Number.isInteger(currentValB) || !Number.isInteger(currentValC)) {
        console.error("Invalid numerical input. Please provide integers.");
        return;
    }

    let totalTransformations = 0; // Counter for the number of operations performed.

    // Check for the special case where all initial values are identical.
    if (currentValA === currentValB && currentValB === currentValC) {
        if (allNumbersAreEven(currentValA, currentValB, currentValC)) {
            // If all are identical and even, the process would loop infinitely.
            totalTransformations = -1;
        }
        // If all are identical and odd, totalTransformations remains 0, as no steps are needed.
    } else {
        // Proceed with the transformation loop as long as all numbers remain even.
        while (allNumbersAreEven(currentValA, currentValB, currentValC)) {
            // Store the current state before applying the transformation.
            const previousA = currentValA;
            const previousB = currentValB;
            const previousC = currentValC;

            // Apply the transformation rule.
            currentValA = (previousB + previousC) / 2;
            currentValB = (previousA + previousC) / 2;
            currentValC = (previousA + previousB) / 2;

            // Increment the transformation counter.
            totalTransformations++;

            // Optional: Add a safety break for extremely long loops, though not strictly needed for this problem's constraints.
            if (totalTransformations > 1000000) { // Arbitrary large number to prevent infinite loops in unexpected scenarios.
                console.warn("Loop exceeded maximum iterations, breaking early.");
                totalTransformations = -1; // Indicate a potential problem or infinite loop
                break;
            }
        }
    }

    // Output the final count of transformations.
    console.log(totalTransformations);
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be modified by the problem solver.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));