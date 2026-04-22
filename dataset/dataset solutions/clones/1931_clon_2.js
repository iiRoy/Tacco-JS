// Module utility function: Retrieves a specified Node.js module.
const grabModule = ( moduleIdentifier ) => require( moduleIdentifier ) ;

// Type conversion utility: Transforms a string into a numerical format.
const convertToNumeric = ( textualValue ) => Number( textualValue ) ;

// Output utility function: Prints a given message string to the standard output stream.
const displayOutput = ( messageString ) => {
    console.log( messageString ) ;
};

// Access the core file system capabilities.
const fileSystemModule = grabModule( "fs" ) ;

// Synchronously read the entire content from the standard input path.
// The content is processed as a UTF8 encoded string.
const rawDataString = fileSystemModule.readFileSync( "/dev/stdin", "utf8" ) ;

// Split the acquired raw data into an array of distinct lines.
const textRowsArray = rawDataString.split( '\n' ) ;

// Process the initial line of input:
// - It's divided by spaces.
// - Each segment is then converted into a numeric value.
// - These two resulting numeric values are destructured into named variables.
const [ firstDimensionValue, secondDimensionValue ] = textRowsArray[0]
                                                        .split( ' ' )
                                                        .map( convertToNumeric ) ;

// Determine an initial base value for subsequent calculations.
// This value is adjusted to be an even number if the primary input dimension is odd.
let currentCalculatedValue = firstDimensionValue - ( firstDimensionValue % 2 || 2 ) ;

// Iterate for a count specified by the second dimension value.
// In each iteration, a formatted pair of numbers is generated and displayed.
for ( let loopCounter = 0 ; loopCounter < secondDimensionValue ; loopCounter++ ) {
    // Compose the output string with the 1-based loop index and the calculated sequence element.
    const outputPair = `${ loopCounter + 1 } ${ currentCalculatedValue - loopCounter }` ;

    // Present the generated numeric pair to the user.
    displayOutput( outputPair ) ;
}