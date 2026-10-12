function generatePermutations(sourceElements, permutationLength) {
    let allPermutations = [];
    const sourceLength = sourceElements.length;

    if (permutationLength === 0) {
        return [[]];
    }

    for (let loopIndex = 0; loopIndex < sourceLength; loopIndex++) {
        const currentElem = sourceElements.shift(); // Remove the first element

        // Recursively generate permutations for the remaining elements
        const subPerms = generatePermutations(sourceElements, permutationLength - 1);

        // Map each sub-permutation by prepending the current element
        const mappedSubPerms = subPerms.map(function(subResult) {
            // Modifies subResult in place and returns it, mimicking original behavior
            subResult.unshift(currentElem);
            return subResult;
        });

        // Add the newly formed permutations to the overall result
        allPermutations = allPermutations.concat(mappedSubPerms);

        // Restore the current element to its original position for the next iteration
        sourceElements.push(currentElem);
    }
    return allPermutations;
}

// Helper function to calculate the weighted sum of a permutation
function calculateWeightedSum(permutationSequence) {
    return permutationSequence.reduce((currentAccumulatedSum, digitValue, digitPositionIndex) => {
        // The weight for each digit is its 1-based index (position + 1)
        const positionWeight = digitPositionIndex + 1;
        return currentAccumulatedSum + digitValue * positionWeight;
    }, 0);
}

function processInputData() {
    // Define the constant set of digits available for permutations
    const baseDigitsForPermutation = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    rawDataBuffer.forEach(function(currentLineText) {
        let matchingPermutationCount = 0;

        // Skip processing if the line is empty or just whitespace
        if (currentLineText.trim() === '') {
            return;
        }

        // Parse the two numeric values from the input line
        const parsedInputValues = currentLineText.split(' ').map(parseFloat);
        const numDigitsToSelect = parsedInputValues[0];
        const targetSumValue = parsedInputValues[1];

        // Generate all possible permutations of `numDigitsToSelect` length
        // A fresh copy of `baseDigitsForPermutation` is passed to avoid side effects
        // across different input lines, as `generatePermutations` modifies its input array.
        const allPossiblePermutations = generatePermutations([...baseDigitsForPermutation], numDigitsToSelect);

        // Iterate through each generated permutation to check its weighted sum
        allPossiblePermutations.forEach(function(currentPermutation) {
            const permutationWeightedSum = calculateWeightedSum(currentPermutation);

            // Increment counter if the permutation's sum matches the target
            if (permutationWeightedSum === targetSumValue) {
                matchingPermutationCount++;
            }
        });
        console.log(matchingPermutationCount);
    });
}

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingDataChunk) {
    rawDataBuffer += incomingDataChunk;
});
process.stdin.on('end', function() {
    // Once all input is received, split it into an array of lines
    // and reassign the global variable to hold this array.
    rawDataBuffer = rawDataBuffer.split('\n');
    // Begin processing the input data
    processInputData();
});
