function ProcessData(rawData) {
    // Break down the raw input string into individual line fragments.
    let lineFragments = rawData.split("\n");

    // Extract the first line to get the total number of elements and queries.
    const [totalElements, totalQueries] = lineFragments.shift().split(" ").map((valString) => parseInt(valString, 10));

    // Retrieve the sequence of integers for processing.
    const dataSequence = lineFragments.shift().split(" ").map((valString) => parseInt(valString, 10));


    // --- Prepare auxiliary structures for tracking element occurrences ---

    // A mapping to store the last encountered position of each numerical value.
    // Initialized with -1 to indicate no prior occurrence for any number up to totalElements.
    const lastSeenMap = new Array(totalElements + 1).fill(-1);

    // A collection of lists, where each list stores indices of subsequent occurrences
    // for a number that first appeared at the list's index.
    const reoccurrenceLists = new Array(totalElements + 1);
    for (let currentArrayIndex = 0; currentArrayIndex < reoccurrenceLists.length; currentArrayIndex++) {
        reoccurrenceLists[currentArrayIndex] = []; // Ensure each slot holds an empty array.
    }

    // Iterate through the main data sequence to populate the reoccurrence tracking structures.
    for (let elemIdx = 0; elemIdx < totalElements; ++elemIdx) {
        const prevOccurIdx = lastSeenMap[dataSequence[elemIdx]]; // Get the last known index of the current element's value.
        if (prevOccurIdx !== -1) { // If this element has appeared before...
            reoccurrenceLists[prevOccurIdx].push(elemIdx); // ...register its current index under its previous occurrence.
        }
        lastSeenMap[dataSequence[elemIdx]] = elemIdx; // Update the last seen position for this element's value.
    }


    // --- Initialize structures for handling query operations ---

    // An array of arrays, grouping queries by their starting position.
    const startIndexedQueries = new Array(totalElements + 1);
    for (let initIdx = 0; initIdx < startIndexedQueries.length; initIdx++) {
        startIndexedQueries[initIdx] = []; // Initialize each entry with an empty list.
    }

    // Process each incoming query and store it appropriately.
    for (let currentQueryNumber = 0; currentQueryNumber < totalQueries; currentQueryNumber++) {
        let [queryStartPos, queryEndPos] = lineFragments[currentQueryNumber].split(" ").map((valString) => parseInt(valString, 10));
        --queryStartPos; // Adjust query start to be zero-indexed.
        --queryEndPos;   // Adjust query end to be zero-indexed.
        startIndexedQueries[queryStartPos].push([queryEndPos, currentQueryNumber]); // Store query details (end position, original index).
    }

    // This array will hold the computed results for all queries.
    const resultCollection = [];


    // --- Implement Fenwick Tree (BIT) for efficient range sum queries ---

    // The data structure for the Binary Indexed Tree, initialized to zeros.
    const bitArray = new Array(totalElements + 1).fill(0);

    // Main loop: Process elements from right to left to correctly handle queries.
    for (let currentProcessingIndex = totalElements - 1; currentProcessingIndex >= 0; --currentProcessingIndex) {

        // Handle reoccurring elements that started at 'currentProcessingIndex'.
        const reoccurrenceCount = reoccurrenceLists[currentProcessingIndex].length;
        for (let subItemIndex = 0; subItemIndex < reoccurrenceCount; subItemIndex++) {
            let updateTargetIndex = reoccurrenceLists[currentProcessingIndex][subItemIndex];
            // Update the BIT for each subsequent occurrence.
            for (updateTargetIndex++; updateTargetIndex <= totalElements; updateTargetIndex += updateTargetIndex & -updateTargetIndex) {
                bitArray[updateTargetIndex] += 1;
            }
        }

        // Process all queries whose range begins at 'currentProcessingIndex'.
        const queriesInGroupCount = startIndexedQueries[currentProcessingIndex].length;
        for (let subItemIndex = 0; subItemIndex < queriesInGroupCount; subItemIndex++) {
            const [queryEndPos, originalQueryIndex] = startIndexedQueries[currentProcessingIndex][subItemIndex];
            let duplicateCount = 0; // Accumulator for duplicates within the query range.
            let bitQueryIndex = queryEndPos;
            // Query the BIT to find the sum of duplicates up to 'queryEndPos'.
            for (bitQueryIndex++; bitQueryIndex; bitQueryIndex -= bitQueryIndex & -bitQueryIndex) {
                duplicateCount += bitArray[bitQueryIndex];
            }
            // The answer is the total elements in the range minus the count of duplicates.
            resultCollection[originalQueryIndex] = (queryEndPos - currentProcessingIndex + 1) - duplicateCount;
        }
    }

    // Output all the computed results for each query.
    for (let outputIdx = 0; outputIdx < totalQueries; outputIdx++) {
        console.log(resultCollection[outputIdx]);
    }
    // The function completes its execution.
    return;
}

// Invoke the primary processing function with input read from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));