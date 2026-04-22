function ProcessData(rawData) {
    // Split the raw input string into separate lines
    rawData = rawData.split('\n');

    // Parse the first line for the number of elements in the primary dataset
    let numElements = parseInt(rawData[0], 10);
    // Parse the third line for the number of query items
    let numQueries = parseInt(rawData[2], 10);

    // Split the second line to get individual source values
    rawData[1] = rawData[1].split(' ');
    // Split the fourth line to get individual query values
    rawData[3] = rawData[3].split(' ');

    // Initialize arrays to store parsed integer values
    let sourceArray = new Array(numElements);
    let targetQueries = new Array(numQueries);

    // Populate the source array by parsing integer values
    for (let idxPrimary = 0; idxPrimary < numElements; idxPrimary++) {
        sourceArray[idxPrimary] = parseInt(rawData[1][idxPrimary], 10);
    }

    // Populate the target queries array by parsing integer values
    for (let idxPrimary = 0; idxPrimary < numQueries; idxPrimary++) {
        targetQueries[idxPrimary] = parseInt(rawData[3][idxPrimary], 10);
    }

    // Initialize a counter for successful matches
    let foundMatches = 0;

    // Outer loop: iterate through each query item
    for (let idxPrimary = 0; idxPrimary < numQueries; idxPrimary++) {
        let idxSecondary; // Declare inner loop index
        // Inner loop: search for the current query item in the source array
        for (idxSecondary = 0; idxSecondary < numElements; idxSecondary++) {
            // If a match is found
            if (sourceArray[idxSecondary] === targetQueries[idxPrimary]) {
                break; // Exit the inner loop as the item is found
            }
        }
        // If the inner loop terminated early (i.e., a match was found)
        if (idxSecondary < numElements) {
            foundMatches++; // Increment the total match count
        }
    }
    // Output the final count of found query items
    console.log(foundMatches);
}

// Read input from standard input and pass it to the processing function
ProcessData( require('fs').readFileSync('/dev/stdin', 'utf8') );