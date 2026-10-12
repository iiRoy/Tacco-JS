function calculateEditDistance(firstString, secondString) {
    // Initialize a 2D array (matrix) to store edit distances
    // The dimensions are (length of firstString + 1) by (length of secondString + 1)
    const distanceMatrix = new Array(firstString.length + 1).fill(0).map(() => new Array(secondString.length + 1));

    // Populate the first column: distance from empty string to prefix of firstString
    for (let rowIdx = 0; rowIdx <= firstString.length; ++rowIdx) {
        distanceMatrix[rowIdx][0] = rowIdx;
    }

    // Populate the first row: distance from empty string to prefix of secondString
    for (let colIdx = 0; colIdx <= secondString.length; ++colIdx) {
        distanceMatrix[0][colIdx] = colIdx;
    }

    // Fill the rest of the matrix using dynamic programming
    for (let rowIdx = 1; rowIdx <= firstString.length; ++rowIdx) {
        // Get the character code for the current character in the first string
        const charOneCode = firstString.charCodeAt(rowIdx - 1);

        for (let colIdx = 1; colIdx <= secondString.length; ++colIdx) {
            // Get the character code for the current character in the second string
            const charTwoCode = secondString.charCodeAt(colIdx - 1);

            // If characters match, no additional cost
            if (charOneCode === charTwoCode) {
                distanceMatrix[rowIdx][colIdx] = distanceMatrix[rowIdx - 1][colIdx - 1];
            } else {
                // If characters differ, take the minimum of three operations:
                // 1. Substitution (diagonal + 1)
                // 2. Deletion (above + 1)
                // 3. Insertion (left + 1)
                distanceMatrix[rowIdx][colIdx] = Math.min(
                    distanceMatrix[rowIdx - 1][colIdx - 1] + 1, // Substitution
                    distanceMatrix[rowIdx - 1][colIdx] + 1,     // Deletion
                    distanceMatrix[rowIdx][colIdx - 1] + 1      // Insertion
                );
            }
        }
    }
    // The bottom-right cell contains the total Levenshtein distance
    return distanceMatrix[firstString.length][secondString.length];
}


// Use a Promise to handle asynchronous standard input
new Promise(function(resolve, reject) {
    let inputBuffer = ""; // Accumulator for incoming data
    // Event listener for 'data' chunks from stdin
    process.stdin.on("data", dataSegment => {
        inputBuffer += dataSegment; // Append data to the buffer
    });
    // Event listener for 'end' of stdin stream
    process.stdin.on("end", () => {
        // Resolve the promise with the accumulated input and stdout stream
        resolve([inputBuffer, process.stdout]);
    });
}).then(function([inputContent, outputStream]) {
    // Once the promise resolves, process the input
    // Split the input content by newline to get the two strings
    const [firstInputString, secondInputString] = inputContent.split("\n");
    // Calculate the Levenshtein distance and write it to stdout, followed by a newline
    outputStream.write(`${calculateEditDistance(firstInputString, secondInputString)}\n`);
});
