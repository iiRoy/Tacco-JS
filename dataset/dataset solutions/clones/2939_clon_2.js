// This function serves as the primary entry point for processing input data.
function ProcessData(rawData) {
    // Normalize the incoming string by removing leading/trailing whitespace and splitting it into lines.
    let processedLines = rawData.trim().split("\n");

    // Parse the initial configuration parameters from the first line of input.
    let tempParts = processedLines[0].split(" ");
    let countElements = parseInt(tempParts[0], 10); // Represents the target number of elements for final summation.
    let numOperations = parseInt(tempParts[1], 10); // Indicates how many subsequent modification operations will occur.

    // Initialize an array to hold all numerical data.
    let dataCollection = [];
    // Populate the initial set of numbers into the array from the second line of input.
    for (let idx = 0; idx < countElements; idx++) {
        dataCollection[idx] = parseInt(processedLines[1].split(" ")[idx], 10);
    }

    // Iterate through the remaining input lines, each representing an operation to add values.
    for (let opIdx = 2; opIdx <= numOperations + 1; opIdx++) {
        let operationDetails = processedLines[opIdx].split(" ");
        let insertCount = parseInt(operationDetails[0], 10); // The quantity of values to append.
        let insertValue = parseInt(operationDetails[1], 10); // The specific value to append.

        // Append the 'insertValue' to the 'dataCollection' array 'insertCount' times.
        for (let loopCounter = 0; loopCounter < insertCount; loopCounter++) {
            dataCollection.push(insertValue);
        }
    }

    // Execute a custom quicksort routine on the entire data collection.
    performPartitionSort(0, dataCollection.length);

    // Define the nested quicksort function.
    function performPartitionSort(startIndex, endIndex) {
        // Select the pivot element from the middle of the current array segment.
        let partitionValue = dataCollection[Math.floor((startIndex + endIndex) / 2)];
        // Initialize pointers for the left and right boundaries of the segment.
        let leftPointer = startIndex;
        let rightPointer = endIndex; // Note: This pointer can initially point beyond the array's last element.

        // Begin the partitioning phase.
        while (true) {
            // Advance the left pointer until an element greater than or equal to the pivot is found.
            while (dataCollection[leftPointer] < partitionValue) {
                leftPointer++;
            }
            // Retreat the right pointer until an element less than or equal to the pivot is found.
            // This comparison handles 'undefined' values (if rightPointer is out of bounds) by evaluating to false.
            while (partitionValue < dataCollection[rightPointer]) {
                rightPointer--;
            }
            // If the pointers have crossed or met, the partitioning for this segment is complete.
            if (rightPointer <= leftPointer) {
                break;
            }

            // If pointers have not crossed, swap the elements at their current positions.
            let temporaryHolder = dataCollection[leftPointer];
            dataCollection[leftPointer] = dataCollection[rightPointer];
            dataCollection[rightPointer] = temporaryHolder;
            // Move both pointers inwards to continue the partitioning.
            leftPointer++;
            rightPointer--;
        }

        // Recursively apply quicksort to the left sub-segment if it contains more than one element.
        if (startIndex < leftPointer - 1) {
            performPartitionSort(startIndex, leftPointer - 1);
        }
        // Recursively apply quicksort to the right sub-segment if it contains more than one element.
        if (rightPointer + 1 < endIndex) {
            performPartitionSort(rightPointer + 1, endIndex);
        }
    }

    // Initialize variables for calculating the final sum.
    let finalSum = 0;
    let positiveCount = 0; // Tracks how many positive numbers have been added to the sum.

    // Iterate through the sorted array from the end (largest values) downwards.
    // The loop includes the index 'dataCollection.length' to account for potential array expansion during sort.
    for (let loopIdx = dataCollection.length; loopIdx >= 0; loopIdx--) {
        // Only add positive numbers to the sum. 'undefined' values (if present) will not satisfy this condition.
        if (dataCollection[loopIdx] > 0) {
            finalSum += dataCollection[loopIdx];
            positiveCount++;
        }
        // Stop summing once 'countElements' positive values have been accumulated.
        if (positiveCount === countElements) {
            break;
        }
    }
    // Print the computed sum to the console.
    console.log(finalSum);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
