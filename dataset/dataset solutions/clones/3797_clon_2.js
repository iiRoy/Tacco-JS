// This function processes the given input string to find specific patterns.
function processInput(rawData) {
    // Split the raw input into an array of lines.
    let linesArray = rawData.split('\n');

    // Parse the first line to get the number of elements.
    const numElements = parseInt(linesArray[0], 10);

    // Split the second line into an array of string numbers.
    let dataValues = linesArray[1].split(' ');

    // Convert all string numbers in the dataValues array to integers.
    for (let outerIndex = 0; outerIndex < numElements; outerIndex++) {
        dataValues[outerIndex] = parseInt(dataValues[outerIndex], 10);
    }

    // Initialize a counter for valid pairs.
    let validPairsCount = 0;

    // Optional: For debugging purposes, uncomment the line below.
    // console.log(dataValues);

    // Iterate through the array to find sub-arrays that satisfy the condition.
    for (let outerIndex = 0; outerIndex < numElements; outerIndex++) {
        // Initialize XOR sum and arithmetic sum for the current sub-array starting at outerIndex.
        let xorSum = dataValues[outerIndex];
        let arithmeticSum = dataValues[outerIndex];

        // Each single element itself forms a valid "pair" (or sequence of length 1).
        validPairsCount += 1;

        // Iterate through subsequent elements to extend the sub-array.
        for (let innerIndex = outerIndex + 1; innerIndex < numElements; innerIndex++) {
            // Update XOR sum with the next element.
            xorSum = xorSum ^ dataValues[innerIndex];
            // Update arithmetic sum with the next element.
            arithmeticSum = arithmeticSum + dataValues[innerIndex];

            // Debugging lines, kept commented as in original.
            // console.log(xorSum);
            // console.log(arithmeticSum);

            // Check if the XOR sum equals the arithmetic sum for the current sub-array.
            if (xorSum === arithmeticSum) {
                validPairsCount += 1; // Increment count if condition is met.
            }
        }
    }

    // Output the final count of valid sequences.
    console.log(validPairsCount);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
