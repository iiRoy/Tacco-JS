function ProcessInput(rawData) {
    // Split the raw input string into lines.
    const processedLines = rawData.split("\n");

    // Parse the number of elements from the first line.
    const numElements = parseInt(processedLines[0], 10);

    // Parse the array of lengths from the second line.
    // Each value is converted to an integer.
    const lengthsArray = processedLines[1].split(" ").map(currentValue => parseInt(currentValue, 10));

    // Initialize a counter for valid triangles found.
    let validTrianglesCount = 0;

    // Iterate through all possible combinations of three distinct indices (i, j, k)
    // such that i < j < k. This ensures unique combinations and avoids duplicates.
    for (let idx1 = 0; idx1 < numElements; idx1++) {
        for (let idx2 = idx1 + 1; idx2 < numElements; idx2++) {
            for (let idx3 = idx2 + 1; idx3 < numElements; idx3++) {
                // Check if the three selected lengths are all distinct.
                // This is a prerequisite for forming a non-degenerate triangle with unique side lengths.
                if (!checkDistinct(lengthsArray[idx1], lengthsArray[idx2], lengthsArray[idx3])) {
                    // If not distinct, skip to the next combination.
                    continue;
                }
                // If the lengths are distinct, verify if they satisfy the triangle inequality theorem.
                if (verifyTriangleInequality(lengthsArray[idx1], lengthsArray[idx2], lengthsArray[idx3])) {
                    // If they form a valid triangle, increment the counter.
                    validTrianglesCount++;
                }
            }
        }
    }

    // Output the total number of valid triangles found.
    console.log(validTrianglesCount);
}

/**
 * Determines if three given numbers are all distinct from each other.
 * @param {number} sideA - The first number.
 * @param {number} sideB - The second number.
 * @param {number} sideC - The third number.
 * @returns {boolean} True if all three numbers are unique, false otherwise.
 */
function checkDistinct(sideA, sideB, sideC) {
    // Check if sideA is different from sideB AND sideA is different from sideC AND sideB is different from sideC.
    if (sideA !== sideB && sideA !== sideC && sideB !== sideC) {
        return true; // All values are unique.
    }
    return false; // At least two values are identical.
}

/**
 * Checks if three given side lengths can form a valid triangle according to the triangle inequality theorem.
 * @param {number} sideA - The length of the first side.
 * @param {number} sideB - The length of the second side.
 * @param {number} sideC - The length of the third side.
 * @returns {boolean} True if the sides can form a triangle, false otherwise.
 */
function verifyTriangleInequality(sideA, sideB, sideC) {
    // For a triangle to be valid, the sum of the lengths of any two sides must be greater than the length of the third side.
    if (sideA + sideB > sideC && sideB + sideC > sideA && sideC + sideA > sideB) {
        return true; // The sides satisfy the triangle inequality.
    }
    return false; // The sides do not satisfy the triangle inequality.
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
