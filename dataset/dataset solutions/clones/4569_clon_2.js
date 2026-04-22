// This script processes input data to compute a specific numerical outcome.
function executePrimaryLogic( inputDataString ) {
    // First, preprocess the raw input: trim whitespace, split into lines,
    // and then split each line by space characters.
    let processedInputMatrix = inputDataString
        .trim()
        .split( "\n" )
        .map( ( lineFragment ) => {
            return lineFragment.split( " " )
        } ) ;

    // Extract the two primary dimensions from the first row of the processed data.
    const primaryHeightValue = Number.parseInt( processedInputMatrix[0][0], 10 );
    const primaryWidthValue = Number.parseInt( processedInputMatrix[0][1], 10 );

    // Call the core computation function with the extracted dimensions.
    const finalCalculatedMetric = calculateOptimalSplit( primaryHeightValue, primaryWidthValue );

    // Output the computed metric to the standard console.
    console.log( finalCalculatedMetric );
}

// This function determines the minimal difference in area for a specific geometric partitioning problem.
function calculateOptimalSplit( dimensionA, dimensionB ) {
    // Trivial case: If either dimension is a multiple of three, no split is needed, difference is zero.
    if ( ( dimensionA % 3.0 === 0.0 ) || ( dimensionB % 3.0 === 0.0 ) ) {
        return 0.0;
    }

    // Initialize the best-found difference with the total area (product of dimensions).
    let minimumObservedDifference = dimensionA * dimensionB;
    let temporaryComputedDifference;
    let lastKnownDifference = minimumObservedDifference; // Used for optimization to break early.

    // Iterate through possible division points along the second dimension (dimensionB).
    for ( let segmentIndex = 0.0; segmentIndex <= dimensionB; segmentIndex++ ) {
        // Calculate the maximum possible difference for the current segment configuration.
        // This involves splitting the rectangle into three parts and finding the largest area difference.
        temporaryComputedDifference = Math.max(
            Math.abs( ( segmentIndex * dimensionA ) - ( ( dimensionB - segmentIndex ) * Math.ceil( dimensionA / 2.0 ) ) ),
            Math.abs( ( segmentIndex * dimensionA ) - ( ( dimensionB - segmentIndex ) * Math.floor( dimensionA / 2.0 ) ) ),
            ( dimensionA % 2.0 ) * ( dimensionB - segmentIndex )
        );

        // Update the overall minimum difference found across all segments.
        minimumObservedDifference = Math.min( minimumObservedDifference, temporaryComputedDifference );

        // Early exit optimization: if the differences start increasing, we've passed the optimal point.
        if ( temporaryComputedDifference > lastKnownDifference ) {
            break;
        }

        // Store the current difference to compare with the next iteration.
        lastKnownDifference = temporaryComputedDifference;
    }

    // Swap the dimensions and repeat the process to check the other orientation.
    [ dimensionB, dimensionA ] = [ dimensionA, dimensionB ];

    // Reset the comparison value for the new orientation.
    lastKnownDifference = dimensionA * dimensionB;

    // Iterate through possible division points along the (now swapped) second dimension (dimensionB).
    for ( let partitionIterator = 0.0; partitionIterator <= dimensionB; partitionIterator++ ) {
        // Recalculate differences with the swapped dimensions.
        temporaryComputedDifference = Math.max(
            Math.abs( ( partitionIterator * dimensionA ) - ( ( dimensionB - partitionIterator ) * Math.ceil( dimensionA / 2.0 ) ) ),
            Math.abs( ( partitionIterator * dimensionA ) - ( ( dimensionB - partitionIterator ) * Math.floor( dimensionA / 2.0 ) ) ),
            ( dimensionA % 2.0 ) * ( dimensionB - partitionIterator )
        );

        // Update the global minimum difference.
        minimumObservedDifference = Math.min( minimumObservedDifference, temporaryComputedDifference );

        // Early exit if the trend reverses.
        if ( temporaryComputedDifference > lastKnownDifference ) {
            break;
        }

        // Update the reference for the next iteration.
        lastKnownDifference = temporaryComputedDifference;
    }

    // The final result is the minimum of the overall calculated difference and the two dimensions themselves.
    return Math.min( minimumObservedDifference, dimensionA, dimensionB );
}

// Initiate program execution by reading input from the standard file system stream.
executePrimaryLogic( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );