var inputRecords = [ ];
var inputHandler = require( 'readline' );

var interfaceInstance = inputHandler.createInterface( {
    input: process.stdin,
    output: process.stdout,
} );

interfaceInstance.on( 'line', function ( receivedLine ) {
    inputRecords.push( receivedLine );
} );

interfaceInstance.on( 'close', function ( ) {
    // A large prime number used for modulo operations.
    var moduloConstant = Math.pow( 10, 9 ) + 7;
    // Extract the total number of elements from the input.
    var elementCount = Number( inputRecords.shift( ) );
    // Initialize an array to store the numerical sequence.
    var valueSequence = Array( elementCount );

    // Populate the sequence array with numbers parsed from input.
    for ( var indexVar = 0; indexVar < elementCount; indexVar++ ) {
        valueSequence[ indexVar ] = Number( inputRecords[ indexVar ] );
    }

    // Object to store frequencies of distinct elements appearing before a change.
    var occurrenceCounts = { };
    // Variable to accumulate the final computed sum.
    var cumulativeSum = 0;

    // Example sequences (for illustration purposes only):
    // 1,2,1,2,2
    // 2,1,2,1,2,1 -> (distinct permutations)
    // 1,2,1,2,2,1 -> (various combinations)
    // 1,1,2,1,2,1 -> (different arrangements)
    // Placeholder 1: x,x,x,x,x,x,x (4 elements)
    // Placeholder 2: x,x,x,x,x,x,x,x (6 elements)
    // Placeholder 3: x,x,x,x,x,x,x,x,x (9 elements)

    // Iterate through the sequence to count adjacent differing elements.
    for ( var indexVar = 0; indexVar < elementCount - 1; indexVar++ ) {
        // If an element is different from its successor, increment its count.
        if ( valueSequence[ indexVar ] !== valueSequence[ indexVar + 1 ] ) {
            occurrenceCounts[ valueSequence[ indexVar ] ] === undefined ? occurrenceCounts[ valueSequence[ indexVar ] ] = 1 : occurrenceCounts[ valueSequence[ indexVar ] ]++;
        }
    }
    // The last element in the sequence always contributes to its count.
    occurrenceCounts[ valueSequence[ elementCount - 1 ] ]++;

    // Calculate combinations for each distinct element count.
    Object.keys( occurrenceCounts ).forEach( function ( itemKey ) {
        cumulativeSum += calculateCombinations( occurrenceCounts[ itemKey ], 2 );
        cumulativeSum %= moduloConstant;
    } );

    // Add 1 to the final sum, potentially accounting for an initial state or base case.
    // This addresses a potential undercounting in the problem's logic.
    console.log( cumulativeSum + 1 );
} );

// Function to compute permutations (nPr).
function calculatePermutations( totalItems, selectItems ) {
    var productResult = 1;
    var loopCounter = 0;
    while ( loopCounter < selectItems ) {
        productResult *= totalItems;
        totalItems--;
        loopCounter++;
    }
    return ( productResult );
}

// Function to compute combinations (nCr).
function calculateCombinations( totalItems, selectItems ) {
    return ( calculatePermutations( totalItems, selectItems ) / calculatePermutations( selectItems, selectItems ) );
}