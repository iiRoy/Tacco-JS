// This utility function is designed to convert a string representation into an integer, using base 10.
var parseInteger = ( inputString ) => {
    return parseInt( inputString , 10 );
};

// This function processes an array of strings, converting each element into its integer equivalent.
var parseIntegerArray = ( stringArray ) => stringArray.map( ( elementString ) => parseInteger(elementString) );

// A simple helper to compute the absolute magnitude of a given numerical value.
var absoluteValue = ( numericInput ) => ( numericInput > 0 ) ? numericInput : -numericInput ;

// Function to determine the smallest value from a variable number of arguments.
function findMinimum()
{
    var inputValues = arguments;
    var currentMinimum = inputValues[ 0 ];

    for ( var idx = 1 ; idx < inputValues.length ; idx++ )
    {
        if ( inputValues[ idx ] < currentMinimum )
        {
            currentMinimum = inputValues[ idx ];
        }
    }
    return currentMinimum;
}

// Function to determine the largest value from a variable number of arguments.
function findMaximum()
{
    var valuesCollection = arguments;
    var currentMaximum = valuesCollection[ 0 ];

    for ( var index = 1 ; index < valuesCollection.length ; index++ )
    {
        if ( valuesCollection[ index ] > currentMaximum )
        {
            currentMaximum = valuesCollection[ index ];
        }
    }
    return currentMaximum;
}

// Computes the greatest common divisor for a series of numerical inputs.
function calculateGCD()
{
    var argumentList = arguments;
    var resultantGCD = argumentList[ 0 ];

    // Inner recursive function implementing the Euclidean algorithm.
    var euclideanAlgorithm = ( valA , valB ) => valB ? euclideanAlgorithm( valB , valA % valB ) : valA ;

    for ( var loopIndex = 1 ; loopIndex < argumentList.length ; loopIndex++ )
    {
        resultantGCD = euclideanAlgorithm( resultantGCD , argumentList[ loopIndex ] );
    }
    return resultantGCD;
}

// The core application logic is initiated here, reading input from the standard stream.
ExecuteSolution( require("fs").readFileSync("/dev/stdin", "utf8") );

// This is the primary function that orchestrates the solution based on the provided input data.
function ExecuteSolution(sourceContent)
{
    // The input content is first divided into an array of individual lines.
    var linesArray = sourceContent.split('\n');

    // The first line of input provides the total number of coordinate points to process.
    var numPoints = parseInteger( linesArray[0] );

    // An array to hold the two-dimensional coordinate pairs.
    var coordinatePairs = [];

    // Loop through each input line (excluding the first) to populate the coordinate data.
    for ( var iter = 0 ; iter < numPoints ; iter++ )
    {
        // Each line is split by space and converted into an array of integers.
        coordinatePairs[ iter ] = parseIntegerArray( linesArray[ iter + 1 ].split(' ') );

        // A critical parity check: the sum of current point's coordinates and the first point's coordinates
        // must have the same parity. If not, an invalid state is detected.
        if ( (coordinatePairs[iter][0] + coordinatePairs[iter][1] + coordinatePairs[0][0] + coordinatePairs[0][1]) % 2 !== 0 )
        {
            console.log(-1); // Output error code
            return 0;        // Exit prematurely
        }
    }

    // Determine the parity of the sum of the X and Y coordinates for the very first point.
    var firstPointParity = ( coordinatePairs[0][0] + coordinatePairs[0][1] ) % 2;

    // If the initial point's coordinate sum is odd, a transformation is applied to all points.
    if ( firstPointParity === 1 )
    {
        // For every coordinate pair, if its X-coordinate is even, the pair remains unchanged.
        // Otherwise, the order of X and Y in the pair is reversed.
        coordinatePairs = coordinatePairs.map( (currentPair) => currentPair[0] % 2 === 0 ? currentPair : currentPair.reverse() );
    }

    /*
     * This segment calculates a dynamic dimension parameter.
     * It starts with a base value and adjusts it based on the parities
     * of the initial point's X and Y coordinates. This parameter
     * likely influences subsequent path generation.
     */
    var dimensionValue = 20;

    // Increment the dimension if the X-coordinate of the first point is odd.
    if ( coordinatePairs[0][0] % 2 === 1 )
    {
        dimensionValue++;
    }

    // Increment the dimension if the Y-coordinate of the first point is odd.
    if ( coordinatePairs[0][1] % 2 === 1 )
    {
        dimensionValue++;
    }

    // Display the computed dimension value to the console.
    console.log( dimensionValue );

    // Construct an array of '1's with a length equal to the calculated dimension.
    var directionList = [];
    directionList.length = dimensionValue;
    directionList.fill( 1 );
    // Convert this array into a space-separated string for output.
    directionList = directionList.join(' ');
    // Output the generated string of ones.
    console.log( directionList );

    // Iterate through each coordinate point to generate a unique movement path.
    for ( var pointIndex = 0 ; pointIndex < numPoints ; pointIndex++ )
    {
        var pathString = ''; // Initialize an empty string to build the path for the current point.
        var currentCoord = coordinatePairs[ pointIndex ]; // Reference to the current coordinate pair.

        // If the X-coordinate is odd, append 'R' to the path and increment X.
        if ( currentCoord[0] % 2 === 1 )
        {
            pathString += 'R';
            currentCoord[0]++;
        }
        // If the Y-coordinate is odd, append 'R' to the path and increment Y.
        if ( currentCoord[1] % 2 === 1 )
        {
            pathString += 'R';
            currentCoord[1]++;
        }

        // Append 'R' characters based on a formula involving the X-coordinate.
        pathString += ''.padEnd( ( 10 + currentCoord[0] ) / 2 , 'R' );
        // Append 'L' characters based on a formula involving the X-coordinate.
        pathString += ''.padEnd( ( 10 - currentCoord[0] ) / 2 , 'L' );
        // Append 'U' characters based on a formula involving the Y-coordinate.
        pathString += ''.padEnd( ( 10 + currentCoord[1] ) / 2 , 'U' );
        // Append 'D' characters based on a formula involving the Y-coordinate.
        pathString += ''.padEnd( ( 10 - currentCoord[1] ) / 2 , 'D' );

        // Output the final generated path string for the current point.
        console.log( pathString );
    }

    return 0; // The program concludes successfully.
}