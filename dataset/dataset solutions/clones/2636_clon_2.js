function ProcessInput(rawData) {
    // Split the entire input string into an array of lines
    rawData = rawData.split("\n");

    // Extract the second line, split it by spaces, and convert elements to numbers
    var dataArray = rawData[1].split(" ").map(Number);

    // Sort the numeric array in ascending order
    dataArray = dataArray.sort(function(firstVal, secondVal) {
        return firstVal - secondVal;
    });

    // Calculate the initial average of the first two elements
    var currentAverage = (dataArray[0] + dataArray[1]) / 2;

    // Remove the first two elements from the array
    dataArray.shift();
    dataArray.shift();

    // Continue processing the array until it becomes empty
    while (dataArray.length !== 0) {
        // Find the correct insertion point for the current average and insert it into the array
        dataArray.splice(binaryInsertPosition(dataArray, currentAverage), 0, currentAverage);

        // Recalculate the average using the new first two elements
        currentAverage = (dataArray[0] + dataArray[1]) / 2;

        // Remove the first two elements again for the next iteration
        dataArray.shift();
        dataArray.shift();
    }

    // Output the final calculated average to the console
    console.log(currentAverage);
}

// Invoke the main processing function, reading input from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Performs a binary search on a sorted array to find an element or its insertion point.
 *
 * @param {Array<number>} targetArray - The sorted array to search within.
 * @param {number} valueToInsert - The value to locate or find an insertion index for.
 * @returns {number} The index of the found value, or the index where it should be inserted
 *                   to maintain the sorted order if not found.
 */
function binaryInsertPosition(targetArray, valueToInsert) {
    var foundIndex = -1; // Stores the index if the value is found

    // Initialize the left boundary of the search range
    var leftBound = 0;

    // Initialize the right boundary of the search range
    var rightBound = targetArray.length - 1;

    // Loop as long as the search range is valid (left boundary is less than or equal to right boundary)
    while (leftBound <= rightBound) {
        // Calculate the middle index of the current search range
        var midPoint = Math.floor((leftBound + rightBound) / 2);

        // Compare the element at the middle index with the value we are looking for
        if (targetArray[midPoint] === valueToInsert) {
            // If a match is found, store its index and terminate the search
            foundIndex = midPoint;
            break;
        } else if (targetArray[midPoint] < valueToInsert) {
            // If the middle element is less than the target value, search in the right half
            leftBound = midPoint + 1;
        } else {
            // If the middle element is greater than the target value, search in the left half
            rightBound = midPoint - 1;
        }
    }

    // If the value was found during the search, return its index
    if (foundIndex !== -1) {
        return foundIndex;
    } else {
        // If the value was not found, 'leftBound' indicates the correct insertion point
        return leftBound;
    }
}
