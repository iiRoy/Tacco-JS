function ProcessData(rawData) {
    // Break down the raw input string into separate lines
    let lines = rawData.split('\n');

    // Extract the first line, which might indicate item count (though unused in this specific logic)
    let itemCount = lines[0];

    // Parse the second line, splitting it by space to get individual string values
    let numericValues = lines[1].split(' ');

    // Iterate through the array to convert all string values to integers
    for (let idx = 0; idx < numericValues.length; idx++) {
        numericValues[idx] = parseInt(numericValues[idx], 10);
    }

    // Apply a custom merge-style sorting algorithm to the array of numbers
    numericValues = combineSort(numericValues);

    // Output the difference between the two middle elements of the sorted array
    // This calculation finds the two elements closest to the array's center
    console.log(
        numericValues[numericValues.length / 2] - numericValues[numericValues.length / 2 - 1]
    );
}

// Implements a merge sort algorithm to order a given array
function combineSort(sourceArray) {
    // Helper function to recursively divide the array into smaller segments
    const divideAndConquer = function(currentSegment) {
        // Base condition for recursion: if segment has 0 or 1 element, it's already sorted
        if (currentSegment.length < 2) {
            return currentSegment;
        }

        // Determine the middle point to split the segment
        const medianPoint = Math.floor(currentSegment.length / 2);

        // Recursively sort the left and right halves
        let leftHalf = divideAndConquer(currentSegment.slice(0, medianPoint));
        let rightHalf = divideAndConquer(currentSegment.slice(medianPoint, currentSegment.length));

        // Merge the two sorted halves back together
        return mergeHalves(currentSegment, leftHalf, rightHalf);
    };

    // Helper function to merge two sorted arrays into a single sorted array
    const mergeHalves = function(originalContainer, leftPortion, rightPortion) {
        // This condition is likely unreachable in a standard merge sort implementation
        // as rightPortion will always be an array returned by divideAndConquer.
        if (rightPortion === undefined) {
            return originalContainer;
        }

        let mergedResult = []; // Array to store the combined sorted elements
        let leftElement, rightElement; // Variables to hold current elements from each portion

        // Continue merging as long as both portions have elements remaining
        while (leftPortion.length > 0 && rightPortion.length > 0) {
            leftElement = leftPortion[0];
            rightElement = rightPortion[0];

            // Compare the first elements and push the smaller one to the result
            if (leftElement < rightElement) {
                mergedResult.push(leftPortion.shift()); // Remove from left portion
            } else {
                mergedResult.push(rightPortion.shift()); // Remove from right portion
            }
        }

        // If elements remain in either portion, concatenate them to the result
        if (leftPortion.length === 0) {
            mergedResult = mergedResult.concat(rightPortion);
        } else if (rightPortion.length === 0) {
            mergedResult = mergedResult.concat(leftPortion);
        }
        return mergedResult; // Return the fully merged and sorted array segment
    };

    // Initiate the sorting process by dividing the initial source array
    return divideAndConquer(sourceArray);
}

// Read input from standard input and pass it to the main processing function
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));