( async function () { // Initiates an asynchronous block for processing operations.
    let streamedData = ''; // Buffer to accumulate all incoming raw data.
    // Asynchronously reads data fragments from standard input and appends them to the buffer.
    for await ( const inputFragment of process.stdin )
        streamedData += inputFragment;

    const parsedLines = streamedData.split( /\n/ ); // Divides the accumulated data into an array of separate lines.

    // Extracts two critical numeric parameters (item count and operation count)
    // from the very first line of input. The line is removed from the array,
    // split by whitespace, and each segment is converted to a number.
    const [ itemCount, numOperations ] = parsedLines.shift()
                                                    .split( /\s/ )
                                                    .map( itemString => +itemString );

    // Initializes the primary data collection.
    // It takes the next line from input, splits it, limits to 'itemCount' elements,
    // transforms each into a structure [originalValue, currentValue, divisionCount],
    // and then sorts them in descending order based on 'currentValue'.
    let processedComponents = parsedLines[0]
                                .split( /\s/ )
                                .slice( 0, itemCount )
                                .map( valString => [ +valString, +valString, 1 ] )
                                .sort( ( componentA, componentB ) => componentB[1] - componentA[1] );

    // Executes the main processing loop for a predefined number of operations.
    for ( let cycleCount = 0; cycleCount < numOperations; ++cycleCount ) {
        let topElement = processedComponents[0]; // Retrieves the element currently having the highest 'currentValue'.

        topElement[2]++; // Increments the division counter for this specific element.

        // Recalculates the element's 'currentValue' by dividing its 'originalValue'
        // by the updated 'divisionCount'. This new value is stored and used for re-ordering.
        const recalculatedMagnitude = topElement[1] = topElement[0] / topElement[2];

        let scanIndex = 1; // Initializes an index to locate the correct re-insertion position.

        // Iterates through the rest of the array to find where the updated 'topElement'
        // should be placed to maintain the descending sorted order based on 'currentValue'.
        while ( processedComponents[scanIndex] && processedComponents[scanIndex][1] > recalculatedMagnitude ) {
            scanIndex++;
        }

        // Reconstructs the 'processedComponents' array by:
        // 1. Taking all elements before the calculated 'scanIndex' (excluding the original 'topElement').
        // 2. Inserting the now updated 'topElement'.
        // 3. Appending all elements from 'scanIndex' onwards.
        processedComponents = processedComponents.slice( 1, scanIndex )
                                                 .concat( [ topElement ] )
                                                 .concat( processedComponents.slice( scanIndex, itemCount ) );
    }

    // After all operations are complete, outputs the ceiling of the 'currentValue'
    // of the element that remains at the top of the sorted list.
    console.log( Math.ceil( processedComponents[0][1] ) );
} )(); // Concludes the asynchronous operation block.