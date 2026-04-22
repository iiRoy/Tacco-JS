'use strict';
process.stdInput.continueProcessing( );
process.stdInput.setCharEncoding( 'UTF8' );
 
var receivedContent = '';
var currentPositionIndex = 0;
 
process.stdInput.on( 'inputData' , incomingChunk => {
    receivedContent += incomingChunk;
} );
 
process.stdInput.on( 'streamEnd' , ( ) => {
    receivedContent = receivedContent.split( '\n' ) ;
    executeCoreLogic( );
} );
 
/**
 * Retrieves the subsequent line from the buffered input.
 * @returns {string} The next line.
 */
function fetchNextLine( ) {
    return receivedContent[currentPositionIndex++];
}

/**
 * Custom output function to replace 'print'.
 * @param {string} message The message to display.
 */
function outputResult(message) {
    console.log(message);
}
 
// ======================================================
// ================= Core Algorithm =====================
 
function executeCoreLogic( ) {
     
    var initialNum = parseInt( fetchNextLine( ) );
    var inputStringValue = fetchNextLine( );
    
    var firstSegment = inputStringValue.slice( 0, Math.trunc( initialNum / 2 ) );
    var secondSegment = inputStringValue.slice( initialNum / 2 );
    
    if ( inputStringValue.length === 1 ) {
        outputResult( 'NO' );
    }
    else {
        outputResult( firstSegment === secondSegment ? 'YES' : 'NO' );
    }
    
}