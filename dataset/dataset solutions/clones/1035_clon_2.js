function ProcessInput(rawData) {
    // The input string is first split into an array of lines.
    rawData = rawData.split("\n");

    // Extract the size of the primary array from the first line.
    var arraySize = parseInt(rawData[0], 10);

    // Extract the number of query elements from the third line.
    var queryCount = parseInt(rawData[2], 10);

    // Split the second line, which contains the elements for the primary array, by spaces.
    rawData[1] = rawData[1].split(" ");

    // Split the fourth line, which contains the query elements, by spaces.
    rawData[3] = rawData[3].split(" ");

    // Initialize two arrays: one for the source data and one for the query data.
    var sourceArray = Array(arraySize),
        targetQueries = Array(queryCount);

    // Populate the source array by parsing integer values from the processed input.
    for (var idxA = 0; idxA < arraySize; idxA++) {
        sourceArray[idxA] = parseInt(rawData[1][idxA], 10);
    }

    // Populate the target queries array by parsing integer values from the processed input.
    for (var idxA = 0; idxA < queryCount; idxA++) {
        targetQueries[idxA] = parseInt(rawData[3][idxA], 10);
    }

    // Initialize a counter to keep track of matching elements.
    var matchCounter = 0;

    // Iterate through each element in the target queries array.
    for (var idxA = 0; idxA < queryCount; idxA++) {
        var idxB; // Declare an index for the inner loop.
        // For each query element, iterate through the source array to find a match.
        for (idxB = 0; idxB < arraySize; idxB++) {
            // If a match is found, exit the inner loop.
            if (sourceArray[idxB] == targetQueries[idxA]) {
                break;
            }
        }
        // If the inner loop completed because a match was found (i.e., idxB is less than arraySize).
        if (idxB < arraySize) {
            matchCounter++; // Increment the match counter.
        }
    }

    // Output the final count of matches to the console.
    console.log(matchCounter);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
