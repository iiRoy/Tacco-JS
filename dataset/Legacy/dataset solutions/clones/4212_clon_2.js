function processInput(inputString) {
    // Initialize a mutable string variable by trimming the input.
    let resultString = inputString.trim();

    // Define an array of specific numeric indices for character insertion.
    const insertionPoints = [0, 4, 6, 8];

    // Iterate through each element in the array of insertion points.
    for (let idx = 0; idx < insertionPoints.length; idx++) {
        // Retrieve the current index from the array for processing.
        const currentPoint = insertionPoints[idx];

        // Check if the character at the current index in the result string is not 'A'.
        // If it's not 'A', then insert 'A' at that precise location.
        if (resultString[currentPoint] !== 'A') {
            resultString = resultString.slice(0, currentPoint) + "A" + resultString.slice(currentPoint, resultString.length);
        }
    }

    // After all potential modifications, evaluate if the final string matches "AKIHABARA".
    // Output "YES" if there is an exact match, otherwise output "NO".
    console.log(resultString === "AKIHABARA" ? "YES" : "NO");
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
