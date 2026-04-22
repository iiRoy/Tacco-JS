// This module handles processing of structured input data from a file.
function ProcessInputData(receivedText) {
    // Clean and parse the incoming text. It converts each line into an array of string segments.
    receivedText = receivedText.trim().split("\n").map(function(segment) {
        return segment.split(" ");
    });

    // Initialize the current line offset for navigating through the input data blocks.
    var currentLineOffset = 1;

    // A utility function to find the insertion point for a value in a sorted list.
    // This is equivalent to a lower bound search.
    const searchLowerBound = (sortedList, targetValue) => {
        let startIndex = 0,
            endIndex = sortedList.length - 1,
            midPoint;
        while (startIndex <= endIndex) {
            midPoint = Math.floor((startIndex + endIndex) / 2); // Calculate the middle index.
            if (sortedList[midPoint] < targetValue) {
                startIndex = midPoint + 1; // Move to the right half.
            } else {
                endIndex = midPoint - 1; // Move to the left half.
            }
        }
        return startIndex; // Return the first index where targetValue could be inserted.
    };

    // Main processing loop that iterates through multiple data sets within the input file.
    while (true) {
        // Check if there are no more data blocks to process.
        if (receivedText[currentLineOffset] == null) {
            break;
        }

        // Parse the total number of records for the current data block.
        var numRecords = parseInt(receivedText[currentLineOffset][0], 10);

        // Declare two lists to categorize parsed records based on specific criteria.
        var primaryItems = [];
        var secondaryItems = [];

        var dataEntry; // Temporary variable to hold the parsed numeric values of a single record.
        var minimumTotal = 0; // Accumulates a base sum based on initial record conditions.
        var adjustedCount = numRecords; // Tracks the number of records that require further processing.

        // Loop through each individual record within the current data block.
        for (var recordCounter = 0; recordCounter < numRecords; recordCounter++) {
            // Parse the current line's string segments into an array of integers.
            dataEntry = receivedText[currentLineOffset + recordCounter + 1].map(numericString => parseInt(numericString, 10));

            // Apply conditional logic to categorize records and update sums/counts.
            if (dataEntry[0] === numRecords) {
                // If the first element matches total records, sum the second element and reduce the adjusted count.
                minimumTotal += dataEntry[1];
                adjustedCount--;
            } else if (dataEntry[1] > dataEntry[2]) {
                // If the second element is greater than the third, add to primary items and sum the third element.
                primaryItems.push(dataEntry);
                minimumTotal += dataEntry[2];
            } else if (dataEntry[1] < dataEntry[2]) {
                // If the second element is less than the third, transform the record, add to secondary items, and sum the third element.
                dataEntry = [numRecords - dataEntry[0], dataEntry[2], dataEntry[1]];
                secondaryItems.push(dataEntry);
                minimumTotal += dataEntry[2];
            } else {
                // If the second and third elements are equal, sum the second element and reduce the adjusted count.
                minimumTotal += dataEntry[1];
                adjustedCount--;
            }
        }

        // Sort both categorized lists in ascending order based on their first element.
        primaryItems.sort((itemA, itemB) => itemA[0] - itemB[0]);
        secondaryItems.sort((itemA, itemB) => itemA[0] - itemB[0]);

        // Initialize the final computed sum with the accumulated minimum total.
        var computedSum = minimumTotal;

        // Create a boolean array to manage slot availability for dynamic adjustments.
        var occupiedSlots = Array.from({
            length: adjustedCount
        }, () => false);
        var targetSlot; // Variable to store the currently considered optimal slot index.
        var deltaAmount; // Variable to store the calculated value increase.

        // Process the primary items to find potential sum increases.
        for (var idx = 0; idx < primaryItems.length; idx++) {
            targetSlot = primaryItems[idx][0] - 1; // Determine the initial target slot based on the item's first value.
            deltaAmount = primaryItems[idx][1] - primaryItems[idx][2]; // Calculate the potential increase.

            // Find the first available slot by decrementing from the target slot.
            while (occupiedSlots[targetSlot] !== false) {
                targetSlot--;
            }

            // If a valid (non-negative) and available slot is found, mark it as occupied and add the delta to the sum.
            if (targetSlot >= 0) {
                occupiedSlots[targetSlot] = true;
                computedSum += deltaAmount;
            }
        }

        // Reset the slot availability tracker for processing the secondary items.
        occupiedSlots = Array.from({
            length: adjustedCount
        }, () => false);

        // Process the secondary items, similar to primary items, for additional sum increases.
        for (var idx = 0; idx < secondaryItems.length; idx++) {
            targetSlot = secondaryItems[idx][0] - 1; // Determine the initial target slot.
            deltaAmount = secondaryItems[idx][1] - secondaryItems[idx][2]; // Calculate the potential increase.

            // Find the first available slot by decrementing from the target slot.
            while (occupiedSlots[targetSlot] !== false) {
                targetSlot--;
            }

            // If a valid and available slot is found, mark it and add the delta to the sum.
            if (targetSlot >= 0) {
                occupiedSlots[targetSlot] = true;
                computedSum += deltaAmount;
            }
        }

        // Output the final calculated sum for the current data block.
        console.log(computedSum);

        // Advance the line offset to the beginning of the next data block.
        currentLineOffset += numRecords + 1;
    }
}

// Call the main processing function with data read from standard input as a UTF-8 string.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));