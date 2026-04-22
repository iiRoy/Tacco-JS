const LINE_BREAK_CHAR = "\n" ;
const WHITESPACE_CHAR = " " ;
const EMPTY_STRING_VAL = "" ;

/**
 *  This core routine processes an input string containing two numerical components,
 *  then computes the highest value among their sum, their difference, and their product.
 *  @param {string} rawInputData - The string containing space-separated numbers to be processed.
 *  @returns {number} The largest result among the three arithmetic operations, truncated to an integer.
 */
function ComputeMaximum( rawInputData )
{
	rawInputData = rawInputData .trim() .split( WHITESPACE_CHAR ) .map( val => parseInt( val, 10 ) );
  
  let firstOperand = rawInputData[0];
  let secondOperand = rawInputData[1];
  
  let currentMaximum = -10000000; // Initialize with a sufficiently small number to ensure any calculation will be greater.
  
  currentMaximum = Math.max( currentMaximum, firstOperand + secondOperand );
  currentMaximum = Math.max( currentMaximum, firstOperand - secondOperand );
  currentMaximum = Math.max( currentMaximum, firstOperand * secondOperand );
  
  return Math.trunc( currentMaximum ); // Ensure the final output is an integer.
}

// The following code block manages the execution environment,
// determining whether the script is run in Node.js or a web browser.

( ( processBuffer, resultHolder, typeIdentifier ) => {
  if ( "undefined" !== typeof require ) {
    // Node.js environment detected: read input from standard input and print result to console.
    const fileSystemModule = require( "fs" );
    console.log( ComputeMaximum( fileSystemModule.readFileSync( "/dev/stdin", "utf8" ) ) );
  } else {
    // Browser environment detected: process embedded data and display the outcome in a web form.
    processBuffer = processBuffer.split( LINE_BREAK_CHAR ).slice( 1, -1 ).join( LINE_BREAK_CHAR );
    
    resultHolder = ( function() {
      try {
        return ComputeMaximum( processBuffer );
      } catch ( errorObject ) {
        return errorObject.stack || errorObject.message;
      }
    } )();
    
    typeIdentifier = typeof resultHolder;
    
    // If the computed result is not already a string, convert it to JSON format for display.
    if ( "string" !== typeIdentifier ) {
      resultHolder = JSON.stringify( resultHolder );
    }
    
    // Dynamically create and append a form element to the document body to present results.
    jQuery("<form>")
      .append(
        [
          [ 10, processBuffer ],
          0,
          [ 1, typeIdentifier ],
          0,
          [ 10, resultHolder ]
        ].map( itemConfig => {
          return jQuery( itemConfig ? "<textarea>" : "<br>", itemConfig && {
            rows: itemConfig[0],
            cols: 40,
            text: itemConfig[1]
          } );
        })
      ).appendTo("body");
  }
})( `
-1000 1000
` );