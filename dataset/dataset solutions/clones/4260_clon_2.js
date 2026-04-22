// This module manages incoming text rows for subsequent processing.
var inputDataRows = [ ];

// Obtain the system's line-by-line input handling utility.
var inputReaderModule = require( 'readline' );

// Establish an interactive console interface using standard I/O.
var interfaceHandler = inputReaderModule.createInterface( {
    input:   process.stdin,
    output:  process.stdout
} );

// Register a callback to store each line received.
interfaceHandler.on( 'line', function ( currentLineContent ) {
    inputDataRows.push( currentLineContent );
} );

// Define actions to perform once all input has been received.
interfaceHandler.on( 'close', function ( ) {
    // Extract the total count of items from the initial input line.
    var recordCount = Number( inputDataRows[ 0 ] );

    // Convert the subsequent input lines into arrays of numerical values.
    var firstCollection  = inputDataRows[ 1 ].split( " " ).map( stringValue => Number( stringValue ) );
    var secondCollection = inputDataRows[ 2 ].split( " " ).map( stringValue => Number( stringValue ) );
    var thirdCollection  = inputDataRows[ 3 ].split( " " ).map( stringValue => Number( stringValue ) );

    // Arrange each numerical collection in ascending order for efficient searching.
    firstCollection.sort( ( itemOne, itemTwo ) => itemOne - itemTwo ); // Sorts elements for lower bound search
    secondCollection.sort( ( itemOne, itemTwo ) => itemOne - itemTwo ); // Prepares this set for iteration
    thirdCollection.sort( ( itemOne, itemTwo ) => itemOne - itemTwo ); // Sorts elements for upper bound search


    var cumulativeSum = 0; // Initialize a variable to accumulate the final result.

    // Iterate through each element within the second collection.
    for ( var secondCollectionIndex = 0; secondCollectionIndex < recordCount; secondCollectionIndex++ ) {
        // Determine the count of elements in 'firstCollection' that are less than the current 'secondCollection' value.
        var countSmallerA = findLowerBound( secondCollection[ secondCollectionIndex ], firstCollection, -1, recordCount, null ) + 1;

        // Determine the count of elements in 'thirdCollection' that are greater than the current 'secondCollection' value.
        var countLargerC = recordCount - findUpperBound( secondCollection[ secondCollectionIndex ], thirdCollection, -1, recordCount, null );

        // Add the product of these two counts to the running total.
        cumulativeSum += countSmallerA * countLargerC;
    }
    // Display the final computed aggregate sum.
    console.log( cumulativeSum );
} );

// Implements a modified binary search to find the count of elements strictly less than a target.
function findLowerBound( searchKey, dataSeries, leftBound, rightBound, unusedArgument ) {
    var midpointIndex = Math.floor( ( leftBound + rightBound ) / 2 );

    // Continue the search as long as the bounds define a valid interval.
    while ( leftBound + 1 < rightBound ) {
        // If the element at the midpoint is the target, we need to find the last occurrence of an element smaller than it.
        if ( dataSeries[ midpointIndex ] === searchKey ) {
            midpointIndex--; // Adjust to potentially find a smaller value.
            break;
        }

        // Adjust search bounds based on the comparison result.
        if ( dataSeries[ midpointIndex ] < searchKey ) {
            leftBound = midpointIndex; // Search in the right half as current element is too small.
            midpointIndex = Math.floor( ( leftBound + rightBound ) / 2 );
        }
        else {
            rightBound = midpointIndex; // Search in the left half as current element is too large.
            midpointIndex = Math.floor( ( leftBound + rightBound ) / 2 );
        }
    }
    return ( midpointIndex ); // Returns an index representing the position for elements smaller than searchKey.
}

// Implements a modified binary search to find the count of elements strictly greater than a target.
function findUpperBound( searchKey, dataSeries, leftBound, rightBound, unusedArgument ) {
    var midpointIndex = Math.ceil( ( leftBound + rightBound ) / 2 );

    // Continue the search as long as the bounds define a valid interval.
    while ( leftBound + 1 < rightBound ) {
        // If the element at the midpoint is the target, we need to find the first occurrence of an element larger than it.
        if ( dataSeries[ midpointIndex ] === searchKey ) {
            midpointIndex++; // Adjust to potentially find a larger value.
            break;
        }

        // Adjust search bounds based on the comparison result.
        if ( dataSeries[ midpointIndex ] < searchKey ) {
            leftBound = midpointIndex; // Search in the right half as current element is too small.
            midpointIndex = Math.ceil( ( leftBound + rightBound ) / 2 );
        }
        else {
            rightBound = midpointIndex; // Search in the left half as current element is too large.
            midpointIndex = Math.ceil( ( leftBound + rightBound ) / 2 );
        }
    }
    return ( midpointIndex ); // Returns an index representing the position for elements larger than searchKey.
}