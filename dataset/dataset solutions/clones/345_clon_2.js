// This program reads and evaluates arithmetic expressions provided via standard input.

// Obtain the core Node.js file system utility for input/output operations.
const   fileSystemUtility = require('fs');

// Fetch all content from the standard input stream, treating it as UTF-8 encoded text.
const rawInputData = fileSystemUtility.readFileSync( '/dev/stdin' , 'utf8' );

// Pre-process the raw input: first, remove any leading/trailing whitespace,
// then divide the entire string into an array of individual lines.
let processedLines = ( rawInputData.trim() ) . split ( "\n" );

// The initial line of input is expected to be a numerical value.
// This value signifies the total count of subsequent expressions to be processed.
// We extract this number, convert it to a proper numeric type, and concurrently
// remove it from the 'processedLines' array for the main processing loop.
const loopLimit = Number ( processedLines.shift() );

// Begin an iteration cycle, processing each expression line up to the determined limit.
for ( let loopCounter = 0 ; loopCounter < loopLimit ; loopCounter++ ) {

   // Retrieve the current expression string from the processed lines array.
   let currentExprString = processedLines [ loopCounter ] ;

   // Modify the current expression string by removing its final character.
   // This operation often accounts for extraneous newline characters or similar delimiters.
   currentExprString = currentExprString.substring( 0 , currentExprString.length - 1 );

   // Apply a regular expression replacement: locate patterns of digits, a decimal point,
   // and subsequent digits (e.g., "123.45") and simplify them to just the integer part (e.g., "123").
   currentExprString = currentExprString.replace ( / ( \d+ ) \. \d+ /g , "$1" ) ;

   // Execute the modified string as a JavaScript expression to determine its numerical outcome.
   let computedValue = eval ( currentExprString ) ;

   // Convert the resulting numeric value into an integer (base-10) and then output it to the console.
   console.log ( parseInt ( computedValue , 10 ) ) ;

}