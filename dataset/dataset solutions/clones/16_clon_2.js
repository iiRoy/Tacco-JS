let receivedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataSegment) {
    receivedData += dataSegment; // Accumulate incoming data chunks.
});

process.stdin.on('end', function() {
    receivedData = receivedData.trim().split('\n'); // Process the full input after stream closure.
    startEvaluation(); // Begin the main processing routine.
});

/*
 *   The primary function to execute the logic
 *   once all standard input has been gathered.
 */
function startEvaluation() {
    const recordCount = receivedData[0]; // The first line indicates the number of data entries.

    if (recordCount > 1000) {
        return; // Exit if the number of records exceeds the maximum allowed.
    }

    for (let currentLineIndex = 1; currentLineIndex < receivedData.length; currentLineIndex++) {
        let numericComponents = receivedData[currentLineIndex].split(' '); // Split the current line by spaces to get individual numbers.
        numericComponents.sort(descendingOrder); // Sort these numeric strings in descending order.

        // Validate that each of the three components is within the acceptable range [0, 1000].
        if (numericComponents[0] < 0 || numericComponents[0] > 1000) {
            return;
        }
        if (numericComponents[1] < 0 || numericComponents[1] > 1000) {
            return;
        }
        if (numericComponents[2] < 0 || numericComponents[2] > 1000) {
            return;
        }

        /*
         *   Perform a check for the Pythagorean theorem:
         *   Is the square of the largest number equal to the sum of the squares of the other two?
         */
        if ((numericComponents[0] * numericComponents[0]) === (numericComponents[1] * numericComponents[1]) + (numericComponents[2] * numericComponents[2])) {
            console.log('YES'); // Output 'YES' if the condition holds true.
        } else {
            console.log('NO'); // Output 'NO' otherwise.
        }
    }
}

/*
 *   A utility function used for sorting,
 *   arranging two values in a descending sequence.
 */
function descendingOrder(valA, valB) {
    return valB - valA; // Orders from largest to smallest.
}