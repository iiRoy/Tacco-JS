function processInputData(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    let lineSegments = rawData.split('\n');
    // Remove the first element from the array, as per the original logic.
    lineSegments.shift();

    // Initialize an array to store processed segments, which conceptually represent bridges or intervals.
    let segmentGroups = [];
    // Initialize a counter for the number of distinct, non-overlapping groups found.
    let distinctGroupsCount = 1;

    // Iterate through each line segment obtained from the input.
    for (let outerIndex = 0; outerIndex < lineSegments.length; outerIndex++) {
        // For each line, initialize an empty array to hold its numerical components.
        segmentGroups[outerIndex] = [];
        // The original code iterates from the character code of the first character
        // to the character code of the third character of the current line segment.
        // This implies a specific input format, e.g., "X Y" where X is at index 0 and Y at index 2.
        // The loop will populate the inner array with parsed integer values of these character codes.
        for (let innerValue = lineSegments[outerIndex][0]; innerValue < lineSegments[outerIndex][2]; innerValue++) {
            segmentGroups[outerIndex].push(parseInt(innerValue));
        }
    }

    // Now, iterate through the `segmentGroups` to merge overlapping segments.
    // The loop runs up to `length - 1` because it compares the current element with the next one.
    for (let outerIndex = 0; outerIndex < segmentGroups.length - 1; outerIndex++) {
        // Output the current state of the segment groups array. This is for observation/debugging.
        console.log(segmentGroups);

        // Find common elements (intersection) between the current segment group and the subsequent one.
        let intersectionResult = findCommonElements(segmentGroups[outerIndex], segmentGroups[outerIndex + 1]);

        // If the intersection result is not empty, it means the two groups overlap.
        if (intersectionResult.length !== 0) {
            // Replace the current group with the intersection, effectively merging them.
            segmentGroups[outerIndex] = intersectionResult;
            // Remove the next group since it has been merged into the current one.
            segmentGroups.splice(outerIndex + 1, 1);
            // Decrement the index to re-evaluate the newly merged group against the next (now shifted) group.
            outerIndex--;
        } else {
            // If there's no overlap, increment the count of distinct groups.
            distinctGroupsCount++;
        }
    }
    // Output the final calculated number of distinct groups, ensuring it's an integer.
    console.log(parseInt(distinctGroupsCount));
}

// Helper function to determine common elements between two arrays.
function findCommonElements(firstArray, secondArray) {
    let commonElementsList = []; // Initialize an array to store elements found in both inputs.
    // Iterate over each element in the first array.
    for (let elementIndex = 0; elementIndex < firstArray.length; elementIndex++) {
        // Check if the current element from `firstArray` exists within `secondArray`.
        if (secondArray.indexOf(firstArray[elementIndex]) >= 0) {
            // If it does, add this common element to our result list.
            commonElementsList.push(firstArray[elementIndex]);
        }
    }
    return commonElementsList; // Return the array containing all common elements.
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
