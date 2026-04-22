const processMatrixData = async () => {
    // Acquire all standard input as a single string payload.
    const fullInputPayload = await new Promise(sourceResolver => {
        let accumulatedSegments = '';
        process.stdin.setEncoding('utf8'); // Define character encoding for incoming data
        process.stdin.resume(); // Activate the input stream
        process.stdin.on('data', incomingBlock => {
            accumulatedSegments += incomingBlock;
        });
        process.stdin.on('end', () => {
            sourceResolver(accumulatedSegments); // Resolve the promise with the complete input
        });
    });

    // Deconstruct the input into individual text lines.
    const textLines = fullInputPayload.split('\n');

    // Extract the matrix dimensions from the first line.
    const dimensionParameters = textLines[0].split(' ').map(segment => parseInt(segment, 10));
    const numRowsExpected = dimensionParameters[0]; // Equivalent to 'r' in original
    const numColsForData = dimensionParameters[1]; // Equivalent to 'c' in original

    // Process each subsequent line to transform data rows.
    // Each processed row will include its sum as an additional element.
    const enhancedDataRows = textLines.slice(1) // Skip the dimension line
        .filter(entry => entry.trim() !== '') // Discard any empty lines
        .map(currentEntry => {
            const numericalComponents = currentEntry.split(' ').map(valSegment => parseInt(valSegment, 10));
            // Calculate the sum for the current row.
            const rowSummation = numericalComponents.reduce((runningTotal, componentValue) => runningTotal + componentValue, 0);
            // Return a new array with original components and the row sum appended.
            return [...numericalComponents, rowSummation];
        });

    // Compute the aggregate sums for each column and the grand total.
    // The accumulator starts as an array of zeros, one for each data column plus one for the row sums column.
    const aggregateColumnTotals = enhancedDataRows.reduce((columnAggregates, fullRow) => {
        fullRow.forEach((valueUnit, positionIndex) => {
            columnAggregates[positionIndex] += valueUnit; // Add current value to respective column total
        });
        return columnAggregates;
    }, Array(numColsForData + 1).fill(0)); // Initialize with (c+1) zeros

    // Format all processed data rows into strings.
    const stringifiedRows = enhancedDataRows.map(rowContent => rowContent.join(' '));

    // Format the final aggregate totals row into a string.
    const stringifiedAggregateTotals = aggregateColumnTotals.join(' ');

    // Combine all formatted output lines.
    const finalDisplayElements = [...stringifiedRows, stringifiedAggregateTotals];

    // Output the complete result to the console.
    console.log(finalDisplayElements.join('\n'));
};

// Initiate the matrix processing procedure.
processMatrixData();