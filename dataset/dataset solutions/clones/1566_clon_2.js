( async   () => { /*
    This script processes tabular data from standard input.
    It calculates specific metrics based on row boundaries and column tallies.
*/
    let streamData = ''; // Buffer to accumulate all data read from stdin

    // Asynchronously read data chunks from standard input until EOF
    for await ( const  dataSegment  of  process.stdin ) {
        streamData += dataSegment; // Append each received chunk to the buffer
    }

    let textLines = streamData.split( '\n' ); // Split the entire input buffer into an array of lines

    // Extract the grid dimensions (height and width) from the very first line
    // The first line is removed from 'textLines' using .shift()
    const  [ heightDim, widthDim ]  =  textLines.shift()
                                                .split( ' ' ) // Split the dimension string by space
                                                .map(  val  =>  parseInt( val, 10 )  ); // Convert string parts to integers (base 10)

    // Ensure 'textLines' only contains the actual data rows, up to the specified height
    textLines = textLines.slice( 0, heightDim );

    // Process the remaining text lines:
    // Each line is split by space, then each resulting string is converted to an integer and decremented by one.
    const processedMatrix = textLines.map(  rowStr  =>
        rowStr.split( ' ' ).map(  numStr  =>  parseInt( numStr, 10 ) - 1  )
    );

    // Output the initial parsed dimensions and the fully processed data matrix for debugging
    console.debug( heightDim, widthDim, processedMatrix );

    // Initialize an array 'columnTallies' with 'widthDim' elements, all set to zero.
    // This array will store cumulative counts for each column.
    let columnTallies = new Array( widthDim ).fill( 0 );

    // Begin iterating through each row of the processed data matrix
    for ( let  rowIndex = 0;  rowIndex < heightDim;  rowIndex++ ) {
        let currentMinVal = 1000000; // Initialize a large sentinel value for tracking the minimum 'left' value in the current row

        // Iterate through each column for the current row
        for ( let  colIndex = 0;  colIndex < widthDim;  colIndex++ ) {
            // Optimization: If both the current column's tally and the row's running minimum are very high,
            // it implies this path is already 'blocked' or non-optimal, so skip calculation for this cell.
            if ( columnTallies[ colIndex ] > 500000  &&  currentMinVal > 500000 ) {
                continue; // Move to the next column
            }

            // Retrieve the start and end boundary indices for the current row from the processed matrix
            const  [ startBound, endBound ]  =  processedMatrix[ rowIndex ];

            // Condition 1: If the current column index falls outside the defined boundaries for this row
            if ( colIndex < startBound  ||  colIndex > endBound ) {
                columnTallies[ colIndex ]++; // Increment the counter for this specific column
                // Update 'currentMinVal' to be the minimum of its current value and the newly incremented column tally
                currentMinVal = Math.min( currentMinVal, columnTallies[ colIndex ] );
            }
            // Condition 2: If the current column index is within bounds, AND 'currentMinVal' is still very high (sentinel value)
            else if ( currentMinVal > 500000 ) {
                columnTallies[ colIndex ] = 1000000; // Set this column's tally to a very high value, effectively 'blocking' it
            }
            // Condition 3: If the current column index is within bounds, AND 'currentMinVal' is not excessively high
            else {
                currentMinVal++; // Increment 'currentMinVal'
                columnTallies[ colIndex ] = currentMinVal; // Assign the updated 'currentMinVal' to this column's tally
            }
        }
        // After processing all columns for the current row, output the state of the column tallies
        console.debug( columnTallies );

        // Check if any column tally in the 'columnTallies' array is below a specific threshold (500000)
        if ( columnTallies.some(  val  =>  val < 500000  ) ) {
            // If such a value exists, calculate the minimum value among all column tallies,
            // considering 500000 as the initial minimum if no tally is lower.
            console.info(
                columnTallies.reduce(  ( accumulator, currentMetric )  =>
                    Math.min( accumulator, currentMetric ), 500000
                )
            );
        } else {
            // If all column tallies are at or above the threshold, output -1
            console.info( -1 );
        }
    }
} )(); // End of the self-invoking asynchronous function