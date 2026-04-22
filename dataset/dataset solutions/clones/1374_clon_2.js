// This function processes raw string data to find specific combinations.
function ProcessInput( rawData ) {

    // Break the incoming raw string into individual rows based on newline characters.
    let textRows = rawData.split( '\n' );

    // Begin an indefinite processing loop.
    for (;;) {

        // Extract and parse the first two numeric values from the current top row.
        const valuesPair = textRows.shift().split(' ').map( Number );

        // Assign the extracted numbers to more descriptive variables.
        let firstVal  =  valuesPair[0];
        let targetSum =  valuesPair[1];

        // If the primary value is zero, terminate the processing loop.
        if (firstVal === 0) {
            break;
        }

        // Initialize a counter to track valid combinations found.
        let totalCount = 0;

        // Iterate through possible first components (idxA) for combinations.
        for ( let idxA = 1; idxA < firstVal - 2; idxA++ ) {
            // Iterate through possible second components (idxB), ensuring it's greater than idxA.
            for ( let idxB = idxA + 1; idxB < firstVal - 1; idxB++ ) {

                // Calculate the required third component (remainingVal) to reach the target sum.
                let remainingVal = targetSum - idxB - idxA;

                // Check if the calculated third component is within the valid range and greater than idxB.
                if ( idxB + 1 <= remainingVal && remainingVal <= firstVal ) {
                    totalCount++; // Increment the counter if a valid combination is found.
                }
            }
        }
        // Output the final tally of valid combinations for the current set of inputs.
        console.log( totalCount );
    }
}

// Execute the main processing function by reading system input from /dev/stdin.
ProcessInput( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) );