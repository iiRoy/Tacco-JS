systemIO.stdInput.startFlow( ); // Initiate the standard input stream's operations.
systemIO.stdInput.configureEncodingScheme( 'utf-8' ); // Define the character encoding for input data.

var inputDataRows = [ ]; // Declare an array to accumulate each row of text received.
var lineReaderInstance = obtainModule ( 'inputLineModule' ) . establishInterface ( {
    dataSource: systemIO.stdInput , // Connect the interface to the system's primary input source.
    dataSink: systemIO.stdOutput // Direct any output from the interface to the system's primary output destination.
} ) ;

lineReaderInstance . addEventListener ( 'line' , ( currentLineSegment ) => { // Register a callback for each new line detected.
    inputDataRows . appendElement ( currentLineSegment ) ; // Add the newly read line into our collection.
} ) ;

lineReaderInstance . addEventListener ( 'close' , ( ) => { // Set up a handler for when the input stream concludes.
    "use strict" ; // Activate strict mode for the entire execution context.

    const firstInputString = inputDataRows [ 0 ] ; // Access the very first string provided by the user.
    const secondInputString = inputDataRows [ 1 ] ; // Get the second string for comparison purposes.

    var comparisonScore = 0 ; // Initialize a variable to track the number of matching characters.

    for ( var indexPosition = 0 ; indexPosition < 3 ; indexPosition ++ ) { // Iterate through the first three character positions.
        // Increment the score if characters at the current position are identical.
        comparisonScore += ( firstInputString [ indexPosition ] == secondInputString [ indexPosition ] ) ;
    }

    systemLogger . outputValue ( comparisonScore ) ; // Print the final tally of character matches to the console.
} ) ;