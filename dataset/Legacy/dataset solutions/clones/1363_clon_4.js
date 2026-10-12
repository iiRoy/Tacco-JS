/// <reference path="nodelib/node.js"/>

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (incomingData) {
    const processedString = String(incomingData).trim();

    // Custom parsing logic to replicate the exact behavior of original.trim().split(" ")
    // This handles multiple spaces between numbers and leading/trailing spaces correctly,
    // producing an array that includes empty strings for consecutive delimiters.
    const parsedSegments = [];
    let currentSegmentBuffer = "";
    for (let charPointer = 0; charPointer < processedString.length; charPointer++) {
        if (processedString[charPointer] === ' ') {
            parsedSegments.push(currentSegmentBuffer);
            currentSegmentBuffer = ""; // Reset buffer for next segment
        } else {
            currentSegmentBuffer += processedString[charPointer];
        }
    }
    parsedSegments.push(currentSegmentBuffer); // Add the last segment after the loop

    // Use a reducer to build a new array with elements inserted in sorted order.
    // This replaces the Array.prototype.sort with a custom insertion sort logic,
    // where elements are inserted one by one into their correct sorted position.
    const numericallyOrderedItems = parsedSegments.reduce((sortedCollection, currentItemString) => {
        // Convert the current string item to a number for comparison purposes.
        // This mimics the behavior of (a - b) in the original sort comparator,
        // where empty strings convert to 0.
        const numericRepresentation = Number(currentItemString);

        // Find the correct position to insert the currentItemString to maintain sorted order.
        // Comparisons are done numerically, but the original string is stored.
        let insertionIndex = 0;
        while (insertionIndex < sortedCollection.length && Number(sortedCollection[insertionIndex]) < numericRepresentation) {
            insertionIndex++;
        }
        
        // Insert the original string item at the determined position.
        // This ensures that the final output uses the original string representations.
        sortedCollection.splice(insertionIndex, 0, currentItemString);
        return sortedCollection;
    }, []); // Initialize the reducer with an empty array

    console.log(numericallyOrderedItems.join(" "));
});
