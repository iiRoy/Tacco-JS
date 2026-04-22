// This helper function performs a binary search on a sorted array segment
// to locate the insertion point for a specific value. It returns the index
// of the first element that is greater than or equal to the 'soughtValue'.
// If all elements in the segment are smaller than 'soughtValue', it returns 'endIndex'.
function findFirstGreaterOrEqual(orderedCollection, startIndex, endIndex, soughtValue) {
    let currentLow = startIndex;
    let currentHigh = endIndex;

    // The search continues as long as the range [currentLow, currentHigh) is valid.
    while (currentLow < currentHigh) {
        // Calculate the midpoint to divide the search space.
        // Using bitwise right shift for integer division (equivalent to Math.floor((low + high) / 2)).
        // This method is generally efficient and avoids potential floating point issues.
        const midPoint = currentLow + ((currentHigh - currentLow) >> 1);

        // If the element at 'midPoint' is less than our target, we know the target
        // must be in the upper half (midPoint + 1 to currentHigh).
        if (orderedCollection[midPoint] < soughtValue) {
            currentLow = midPoint + 1;
        } else {
            // Otherwise, the element at 'midPoint' is >= target. The target could
            // be at 'midPoint' or in the lower half (currentLow to midPoint).
            currentHigh = midPoint;
        }
    }
    // 'currentLow' now holds the index of the first element >= 'soughtValue',
    // or 'endIndex' if no such element exists in the specified range.
    return currentLow;
}

// A straightforward comparison function designed for numeric sorting in ascending order.
// It's used as a callback for Array.prototype.sort().
function sortNumbersAscending(firstOperand, secondOperand) {
    return firstOperand - secondOperand;
}

// The primary function responsible for processing input data
// and computing the total number of valid triangles that can be formed
// from the given side lengths.
function calculateValidTriangles(rawInputString) {
    // --- Input Validation and Parsing ---
    // Perform initial checks on the input string to ensure it's valid.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.log(0); // If no valid input, no triangles can be formed.
        return;
    }

    // Split the input into individual lines.
    const inputLines = rawInputString.trim().split("\n");

    // Extract the expected count of elements from the first line.
    // Use Number() for explicit conversion and check for non-numeric values.
    const expectedElementCount = Number(inputLines[0]);
    if (isNaN(expectedElementCount) || expectedElementCount < 3) { // Minimum 3 sides for a triangle.
        console.log(0); // Cannot form triangles with fewer than 3 elements.
        return;
    }

    // Parse the second line, converting space-separated values to numbers.
    // Filter out any potential non-numeric results from the parsing process.
    const numericSidesArray = inputLines[1].split(" ").map(Number).filter(val => !isNaN(val));

    // Additional validation: Ensure the parsed array's length matches the expected count.
    if (numericSidesArray.length !== expectedElementCount) {
        console.log(0); // Mismatch indicates invalid input for the problem.
        return;
    }

    // --- Core Logic for Triangle Counting ---
    // Sort the array of side lengths in ascending order.
    // This step is critical for the binary search optimization.
    numericSidesArray.sort(sortNumbersAscending);

    let totalValidTriplets = 0; // Accumulator for the count of valid triangle combinations.

    // Iterate through all possible combinations for the first two sides (a, b) of a triangle.
    // The outer loop selects the first side, 'sideA'.
    // We need at least two more elements (for sideB and sideC), hence `expectedElementCount - 2`.
    for (let indexA = 0; indexA < expectedElementCount - 2; ++indexA) {
        const sideA = numericSidesArray[indexA];

        // A triangle side must have a positive length. Skip if sideA is not positive.
        // This is an important geometric constraint.
        if (sideA <= 0) {
            continue;
        }

        // The inner loop selects the second side, 'sideB'.
        // 'sideB' must come after 'sideA' in the sorted array (indexB > indexA).
        // We need at least one more element (for sideC), hence `expectedElementCount - 1`.
        for (let indexB = indexA + 1; indexB < expectedElementCount - 1; ++indexB) {
            const sideB = numericSidesArray[indexB];

            // Calculate the sum of the first two sides.
            // According to the triangle inequality, the third side 'c' must be less than `sideA + sideB`.
            const requiredUpperBoundForC = sideA + sideB;

            // Use the binary search helper to find the index of the first element ('sideC')
            // that is greater than or equal to `requiredUpperBoundForC`.
            // The search starts from the element immediately following 'sideB' (indexB + 1).
            const insertionPointForC = findFirstGreaterOrEqual(
                numericSidesArray,
                indexB + 1, // Start index for searching for 'sideC'
                expectedElementCount, // End index for searching (exclusive)
                requiredUpperBoundForC // The value 'sideC' must be less than
            );

            // 'insertionPointForC' is the index of the first element that *violates* the condition `sideC < requiredUpperBoundForC`.
            // Therefore, all elements from `indexB + 1` up to `insertionPointForC - 1` satisfy the condition.
            // The number of such suitable third sides is `(insertionPointForC - 1) - (indexB + 1) + 1`.
            // This simplifies to `insertionPointForC - 1 - indexB`.
            const countOfSuitableThirdSides = insertionPointForC - (indexB + 1);

            // Add the count of valid third sides to the total.
            // Only add if there are actual suitable sides.
            if (countOfSuitableThirdSides > 0) {
                totalValidTriplets += countOfSuitableThirdSides;
            }
        }
    }

    // Output the final computed count.
    console.log(totalValidTriplets);
}

// --- Entry Point for Execution ---
// This self-executing anonymous function handles reading input and initiating the processing.
(function executeProcessingPipeline() {
    // Dynamically import the Node.js file system module.
    const nodeFileSystem = require("fs");
    // Define the standard input file path typical in competitive programming environments.
    const standardInputPath = "/dev/stdin";
    // Read the entire content of the standard input file synchronously.
    // The content is decoded as a UTF-8 string.
    const fileContent = nodeFileSystem.readFileSync(standardInputPath, "utf8");
    // Call the main function to process the obtained file content.
    calculateValidTriangles(fileContent);
})();