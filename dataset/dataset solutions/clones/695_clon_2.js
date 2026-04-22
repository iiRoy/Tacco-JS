function programExecutor(commandArguments) {
    // Declare variables for managing item counts and processing cycles
    let countOfItems;
    let cycleCount;

    // Initiate an endless processing loop
    while (true) {
        // Acquire the total count of items for the current iteration from input
        countOfItems = readInteger();

        // Prepare an array to store the sequence of items
        let itemOrder = new Array(countOfItems);

        // Populate the item sequence; items are numbered from 'countOfItems' down to 1
        for (let loopIndex = 0; loopIndex < countOfItems; loopIndex++) {
            itemOrder[loopIndex] = countOfItems - loopIndex;
        }

        // Obtain the number of shuffling operations to be performed
        cycleCount = readInteger();

        // Evaluate the exit condition: terminate if both counts are zero
        if (cycleCount === 0 && countOfItems === 0) break;

        // Iterate through each shuffling operation
        for (let processIndex = 0; processIndex < cycleCount; processIndex++) {
            // Read the size of the initial segment, adjusting for zero-based indexing
            let segmentSize = readInteger() - 1;
            // Read the quantity of the block to be shifted
            let blockQuantity = readInteger();

            // Create a temporary storage array for the initial segment
            let holdingArray = new Array(segmentSize);

            // Copy the items from the initial segment into the temporary buffer
            for (let copyIndex = 0; copyIndex < segmentSize; copyIndex++) {
                holdingArray[copyIndex] = itemOrder[copyIndex];
            }

            // Shift a block of items (following the initial segment) towards the front of the main array
            for (let moveIndex = 0; moveIndex < blockQuantity; moveIndex++) {
                itemOrder[moveIndex] = itemOrder[moveIndex + segmentSize];
            }

            // Insert the items from the temporary buffer back into the main array, after the shifted block
            for (let placeIndex = 0; placeIndex < segmentSize; placeIndex++) {
                itemOrder[placeIndex + blockQuantity] = holdingArray[placeIndex];
            }
        }

        // Display the value of the first item in the final arrangement
        printLine(itemOrder[0]);
    }
}