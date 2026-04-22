// This function determines the minimum required gap or overlap between two points considering a segment's length.
function calculateSpatialDifference( incomingDataSource ) {

    // First, parse the numerical components from the provided string.
    const segmentDimension = parseInt( incomingDataSource.split(" ")[0] );
    const pointCoordinate1 = parseInt( incomingDataSource.split(" ")[1] );
    const pointCoordinate2 = parseInt( incomingDataSource.split(" ")[2] );

    let ultimateResult; // This variable will hold the final computed value.

    // Evaluate various scenarios to compute the spatial difference.
    if ( ( pointCoordinate2 - pointCoordinate1 - segmentDimension ) > 0 ) {
        ultimateResult = pointCoordinate2 - pointCoordinate1 - segmentDimension;
    }

    else if ( ( pointCoordinate1 - pointCoordinate2 - segmentDimension ) > 0 ) {
        ultimateResult = pointCoordinate1 - pointCoordinate2 - segmentDimension;
    }

    else {
        ultimateResult = 0; // Default to zero if no positive difference is found.
    }

    // Display the calculated outcome to the standard output.
    console.log( ultimateResult );
}

// Invoke the primary calculation routine, providing input from the file system.
calculateSpatialDifference( require("fs").readFileSync("/dev/stdin", "utf8") );
process.stdin.resume();