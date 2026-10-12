process.stdin.resume();
process.stdin.setEncoding("utf8");

// This event listener processes incoming data chunks from standard input.
process.stdin.on("data", function (dataBlock) {
    // Split the input into an array of lines, removing any leading/trailing whitespace.
    let inputLines = dataBlock.trim().split("\n");
    let currentLineIndex = 0;

    // Loop indefinitely until a specific termination condition is met.
    while (true) {
        // Parse the first line of each test case to get N and M.
        let dimensions = inputLines[currentLineIndex].split(/\s+/).map(Number);
        currentLineIndex++;

        let numElements = dimensions[0];
        let numOperations = dimensions[1];

        // If both N and M are zero, it's the end of input.
        if (numElements === 0 && numOperations === 0) {
            break;
        }

        // Initialize an array to track the status of elements.
        // Initially, all elements are considered 'active' or 'unaffected'.
        let statusArray = [];
        for (let idx = 0; idx < numElements; idx++) {
            statusArray[idx] = true; // true means 'active'
        }
        // The first element is always 'inactive' or 'affected'.
        statusArray[0] = false;

        // Store operation records.
        let operationRecords = [];
        for (let idx = 0; idx < numOperations; idx++) {
            let currentRecord = inputLines[currentLineIndex].split(/\s+/).map(Number);
            currentLineIndex++;
            // Store the record, adjusting indices to be 0-based.
            operationRecords.push([currentRecord[0], currentRecord[1] - 1, currentRecord[2] - 1]);
        }

        // Sort the operation records based on their first component (time/order).
        operationRecords.sort(function (itemA, itemB) {
            return itemA[0] - itemB[0];
        });

        // Process each operation record.
        operationRecords.forEach(function (opData) {
            let firstIndex = opData[1];
            let secondIndex = opData[2];

            // If the element at 'firstIndex' is 'inactive', then the element at 'secondIndex' also becomes 'inactive'.
            if (!statusArray[firstIndex]) {
                statusArray[secondIndex] = false;
            }
        });

        // Count the number of 'inactive' elements.
        let resultCount = 0;
        statusArray.forEach(function (elementStatus) {
            if (!elementStatus) { // If the element is 'inactive'
                resultCount++;
            }
        });

        // Output the final count for the current test case.
        console.log(resultCount);
    }
});
