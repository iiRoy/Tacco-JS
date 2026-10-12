( async function () {
    // This variable will accumulate all incoming data from standard input.
    let rawData = '';

    // Asynchronously read data chunks from the standard input stream.
    // Each received chunk is appended to the 'rawData' string.
    for await ( const dataSegment of process.stdin ) {
        rawData += dataSegment;
    }

    // Split the accumulated raw data into individual lines based on newline characters.
    const inputRows = rawData.split( /\n/ );

    // Extract the first line, split it by whitespace, and convert the parts to numbers.
    // These numbers represent 'itemCount' (n) and 'iterations' (k).
    const [ itemCount, iterations ] = inputRows.shift().split( /\s/ ).map( valString => Number( valString ) );

    // Initialize the primary data array.
    // It takes the first remaining line, splits it by whitespace,
    // takes 'itemCount' elements, converts each to a number,
    // and transforms each number into a triplet: [original_value, current_value, divisor_count].
    // Finally, it sorts the array in descending order based on the 'current_value'.
    let dataArray = inputRows[ 0 ]
        .split( /\s/ )
        .slice( 0, itemCount )
        .map( numericStr => [ Number( numericStr ), Number( numericStr ), 1.0 ] ) // Initial divisor count is 1.0
        .sort( ( elemA, elemB ) => elemB[ 1 ] - elemA[ 1 ] );

    // Perform a series of balancing operations for a specified number of 'iterations'.
    for ( let loopCounter = 0; loopCounter < iterations; loopCounter++ ) {
        // Get the element with the highest 'current_value' (always the first element due to sorting).
        let currentMaxElement = dataArray[ 0 ];

        // Increment the divisor count for this element.
        currentMaxElement[ 2 ]++;

        // Recalculate the 'current_value' by dividing the 'original_value' by the new 'divisor_count'.
        // This new value is also assigned back to the element's second position.
        const calculatedValue = currentMaxElement[ 1 ] = currentMaxElement[ 0 ] / currentMaxElement[ 2 ];

        // Find the correct insertion point for the modified element to maintain the sorted order.
        let insertIndex = 1;
        while ( dataArray[ insertIndex ] && dataArray[ insertIndex ][ 1 ] > calculatedValue ) {
            insertIndex++;
        }

        // Reconstruct the 'dataArray':
        // 1. Take elements from the second position up to the 'insertIndex'.
        // 2. Concatenate the modified 'currentMaxElement'.
        // 3. Concatenate the remaining elements from 'insertIndex' to the end of the original array.
        dataArray = dataArray.slice( 1, insertIndex )
                             .concat( [ currentMaxElement ] )
                             .concat( dataArray.slice( insertIndex, itemCount ) );
    }

    // After all iterations, output the ceiling of the 'current_value' of the first element.
    console.log( Math.ceil( dataArray[ 0 ][ 1 ] ) );
} )();
