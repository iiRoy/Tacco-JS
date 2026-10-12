var fileSystem = require('fs');

// Helper function to parse the input string into an array of numbers.
function parseNumberSequence(inputString) {
    return inputString.trim().split("\n").map(Number);
}

var numSequence = parseNumberSequence(fileSystem.readFileSync('/dev/stdin', 'utf8'));

// Helper function to adjust difference values according to the problem's specific modulo and range logic.
function getAdjustedDiffValue(initialDifference, modulusValue, limitIndex) {
    let adjustedDifference = initialDifference;

    // First, ensure the difference is non-negative within the modulus.
    if (adjustedDifference < 0) {
        adjustedDifference += modulusValue;
    }

    // Second, apply the specific wrap-around logic if it exceeds the limit.
    // This might result in a negative value, which will be handled by JavaScript's array property assignment.
    if (limitIndex < adjustedDifference) {
        adjustedDifference -= modulusValue;
    }
    return adjustedDifference;
}

while (true) {
    var currentN = numSequence.shift();

    if (currentN === 0) {
        break;
    }

    if (currentN === 1) {
        console.log("");
        continue;
    }

    // Initialize an array to mark numbers that are perfect squares modulo currentN.
    // Using `new Array().fill(false)` for cleaner initialization.
    const isSquareModN = new Array(currentN).fill(false);

    // Populate the `isSquareModN` array.
    for (let idx = 1; idx < currentN; idx++) {
        const squareResultModN = (idx * idx) % currentN; // Intermediate variable for clarity.
        isSquareModN[squareResultModN] = true;
    }

    // Collect the indices where `isSquareModN` is true.
    // Using `reduce` for a functional approach to filter and map.
    const squareIndices = isSquareModN.reduce((accumulator, isMarked, index) => {
        if (isMarked) {
            accumulator.push(index);
        }
        return accumulator;
    }, []);

    // Calculate the maximum index for the `diffCounts` array.
    // `Math.floor` ensures integer index even if `currentN` is even (though problem context implies odd `currentN`).
    const maxDiffIndex = Math.floor((currentN - 1) / 2);
    // Initialize the `diffCounts` array with zeros.
    const diffCounts = new Array(maxDiffIndex + 1).fill(0);

    // Iterate through pairs of square indices to calculate differences.
    const numberOfSquareIndices = squareIndices.length; // Helper variable for loop boundary.
    for (let idx1 = 0; idx1 < numberOfSquareIndices; idx1++) {
        for (let idx2 = idx1 + 1; idx2 < numberOfSquareIndices; idx2++) {
            const value1 = squareIndices[idx1]; // Helper variable.
            const value2 = squareIndices[idx2]; // Helper variable.

            // Calculate the first difference (value1 - value2) and adjust it.
            const rawDifferenceA = value1 - value2;
            const adjustedDifferenceA = getAdjustedDiffValue(rawDifferenceA, currentN, maxDiffIndex);
            // Increment count. If adjustedDifferenceA is negative, it adds a property to the array object,
            // which is consistent with original behavior (ignored by `shift` and `forEach`).
            diffCounts[adjustedDifferenceA]++;

            // Calculate the second difference (value2 - value1) and adjust it.
            const rawDifferenceB = value2 - value1;
            const adjustedDifferenceB = getAdjustedDiffValue(rawDifferenceB, currentN, maxDiffIndex);
            diffCounts[adjustedDifferenceB]++;
        }
    }

    // Remove the count for difference 0 (which is at index 0).
    diffCounts.shift();

    // Output the final counts, multiplied by 2.
    diffCounts.forEach(function (countValue) {
        console.log(countValue * 2);
    });
}
