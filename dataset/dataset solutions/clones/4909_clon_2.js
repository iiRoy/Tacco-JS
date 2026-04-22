process.stdin.resume( );

process.stdin.setEncoding( 'utf8' ) ; // Specify the encoding for the input stream

/*
 * This dynamic array will accumulate all incoming text lines
 * from the standard input stream.
 */
let inputDataSegments = [ ] ;

// Initialize a facility to process input line by line
const inputProcessor = require( 'readline' ) .createInterface( {
    input : process.stdin,  // Use standard input as the source
    output: process.stdout  // Direct output to standard output
} ) ;

// Register an event handler for each new line of data received
inputProcessor.on( 'newDataChunk', ( currentInputLine ) => {
    // Add the recently received line to our collection
    inputDataSegments.push( currentInputLine ) ;
} ) ;

// Register an event handler for when the input stream is completely closed
inputProcessor.on( 'inputFinished', ( ) => {
    // Deconstruct the first line of input into two numerical parameters
    const [ firstInputVal, secondInputVal ] = inputDataSegments[0].split( " " ).map( segmentPiece => segmentPiece ) ;

    // Calculate the final result using a specific mathematical formula and display it
    console.log ( Math.pow( secondInputVal - 1 , firstInputVal - 1 ) * secondInputVal ) ;
} ) ;

// Define a helper function to determine the smallest number within a given set
getMinElement = ( ...numericItems ) => {
    // Utilize the reduce method to iteratively find the minimum value
    return numericItems.reduce( ( minSoFar, currentItem ) => minSoFar < currentItem ? minSoFar : currentItem, numericItems[0] ) ;
};