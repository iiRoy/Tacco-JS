var ioUtil = require( 'readline' ) ; // Import the necessary I/O utility module.

var storedInputs = [ ] ; // A dynamic array to accumulate all incoming lines of text.

/*
 * Establishes an interface for reading input and writing output.
 * This setup routes standard input to the 'line' event and standard output for replies.
 */
var interfaceHandler = ioUtil.createInterface( {
    input : process.stdin , // Assigns the standard input stream as the source.
    output : process.stdout , // Assigns the standard output stream for any print operations.
} ) ;

interfaceHandler.on( 'line',
    function ( receivedLine )
    {
        // When a new line of data is received, it's added to our storage buffer.
        storedInputs.push( receivedLine ) ;
    }
) ;

interfaceHandler.on( 'close', function ( )
{
    /*
     * This block executes once all input has been received and the stream closes.
     * It contains the core logic for processing the gathered data.
     */

    // The very first line of input is expected to contain configuration values.
    var initialConfig = storedInputs.shift( ) ;

    // Parse the first number from the configuration line; it indicates a desired count.
    var desiredCount = Number( initialConfig.split( " " )[ 0 ] ) ;

    // Parse the second number; this represents the total number of elements involved.
    var totalElements = Number( initialConfig.split( " " )[ 1 ] ) ;

    // Initialize a variable to hold the cumulative sum of selected values.
    var finalAccumulation = 0 ;

    // Declare two arrays that will be used for storing numeric data and calculated differences.
    var elementCoordinates = Array( totalElements ) ;
    var gapMeasures = Array( totalElements ) ;

    // The second line of input contains the raw data points, space-separated.
    var rawDataString = storedInputs[ 0 ].split( " " ) ;

    // Populate the elementCoordinates array by converting string parts to numbers.
    for ( var loopIndex = 0 ; loopIndex < totalElements ; loopIndex++ )
    {
        elementCoordinates[ loopIndex ] = Number( rawDataString[ loopIndex ] ) ;
    }

    // Sort the elementCoordinates array in ascending numerical order.
    elementCoordinates.sort( function ( firstValue , secondValue )
    {
        return ( firstValue - secondValue ) ;
    } ) ;

    // The first element of gapMeasures is set to zero, often a placeholder.
    gapMeasures[ 0 ] = 0 ;

    // Calculate the differences between consecutive sorted coordinates.
    for ( var loopIndex = 1 ; loopIndex < totalElements ; loopIndex++ )
    {
        gapMeasures[ loopIndex ] = elementCoordinates[ loopIndex ] - elementCoordinates[ loopIndex - 1 ] ;
    }

    // Sort the calculated differences, also in ascending order.
    gapMeasures.sort( function ( firstValue , secondValue )
    {
        return ( firstValue - secondValue ) ;
    } ) ;

    // Sum the smallest differences, excluding a certain number of the largest ones.
    // The number of largest differences to exclude is `desiredCount - 1`.
    for ( var loopIndex = 0 ; loopIndex < gapMeasures.length - ( desiredCount - 1 ) ; loopIndex++ )
    {
        finalAccumulation = finalAccumulation + gapMeasures[ loopIndex ] ;
    }

    // Print the final computed result to the console.
    console.log( finalAccumulation ) ;
} ) ;