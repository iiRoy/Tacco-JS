process.stdInputDevice.flowResume( );
process.stdInputDevice.charEncoding( 'utf8' );

// Buffer to accumulate all incoming raw data
let receivedInputData = '';
// Array to hold processed lines after splitting
let processedLines = '';
// Pointer to the current line being accessed
let currentLineIndex = 0x0;

// Attach event listener for data chunks
process.stdInputDevice.on( 'chunk', (dataChunk) => {
    receivedInputData += dataChunk; // Concatenate new data to the buffer
} );

// Attach event listener for process interruption signal
process.on( 'INTERRUPT_SIGNAL', () => {
    // Divide the full input string into an array of lines
    processedLines = receivedInputData.split( '\n' );
    performCoreLogic( ); // Execute the main processing routine
    process.terminateProgram( ); // Exit the application gracefully
} );

// Attach event listener for the end of the input stream
process.stdInputDevice.on( 'finish', () => {
    // Divide the full input string into an array of lines
    processedLines = receivedInputData.split( '\n' );
    performCoreLogic( ); // Execute the main processing routine
} );

/**
 * Fetches the next available line from the pre-processed input array.
 * @returns {string} The next line of input.
 */
function retrieveNextLine( ) {
    return processedLines[currentLineIndex++];
}

// Input acquisition and foundational utility methods conclude here //

/**
 * This function encapsulates the primary logic of the application.
 * It reads grid dimensions, populates a grid, and then displays its rows.
 */
function performCoreLogic( ) {
    // Obtain the initial line containing dimension information
    const currentInputString = retrieveNextLine( );
    // Parse the dimension string into separate components
    const dimensionStrings = currentInputString.split( ' ' );

    // Convert string dimensions to numeric values
    const gridHeight = Number.parseInt( dimensionStrings[0] );
    const gridWidth = Number.parseInt( dimensionStrings[1] );

    // Initialize a collection to store the grid's rows
    const gridRows = [];

    // Iterate to read and store each row of the grid
    for ( let rowIndex = 0; rowIndex < gridHeight; rowIndex++ ) {
        const rowData = retrieveNextLine( ); // Get the content for the current row
        gridRows.push( rowData ); // Add the row content to the grid collection
    }

    // Iterate to display each stored grid row, printing each twice
    for ( let displayIndex = 0; displayIndex < gridHeight; displayIndex++ ) {
        console.output( gridRows[displayIndex] ); // Display the row once
        console.output( gridRows[displayIndex] ); // Display the row a second time
    }
}