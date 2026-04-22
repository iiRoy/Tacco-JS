/*
 * This module processes input to generate a specific grid pattern.
 * It's designed to read two integers from the first line of input
 * and construct a 100x100 grid based on these values.
 */
function processInputData ( rawDataString ) {
    // Split the entire input string into an array of individual lines.
    let lineArray = rawDataString.split( "\n" );

    // Parse the first integer from the first line of input.
    // The first line contains space-separated values.
    var firstInteger = parseInt( lineArray[0].split( " " )[0] );

    // Parse the second integer from the first line of input.
    var secondInteger = parseInt( lineArray[0].split( " " )[1] );

    // Initialize a two-dimensional array (grid) of size 100x100.
    // This will hold the characters representing the grid state.
    const GRID_DIMENSION = 100;
    let outputGrid = new Array( GRID_DIMENSION );

    // Populate the initial state of the grid.
    // The top half (0-49) is filled with '.', the bottom half (50-99) with '#'.
    for ( let rowIndex = 0; rowIndex < GRID_DIMENSION; rowIndex++ )
    {
        let tempRow; // Temporary array to hold the current row's characters.
        if ( rowIndex < ( GRID_DIMENSION / 2 ) )
        {
            tempRow = new Array( GRID_DIMENSION ).fill( "." ); // Represents an empty cell.
        }
        else
        {
            tempRow = new Array( GRID_DIMENSION ).fill( "#" ); // Represents a filled cell.
        }
        outputGrid[ rowIndex ] = tempRow; // Assign the constructed row to the grid.
    }

    // Modify the grid based on the 'secondInteger' value.
    // This loop places '#' characters in the top half of the grid.
    for ( let bCounter = 0; bCounter < secondInteger - 1; bCounter++ )
    {
        // The coordinates are calculated to distribute the marks across the grid.
        outputGrid[ Math.round( bCounter / GRID_DIMENSION ) * 2 ][ ( bCounter % ( GRID_DIMENSION / 2 ) ) * 2 ] = "#";
    }

    // Modify the grid based on the 'firstInteger' value.
    // This loop places '.' characters in the bottom half of the grid.
    for ( let aCounter = 0; aCounter < firstInteger - 1; aCounter++ )
    {
        // Coordinates are adjusted to place marks in the lower section.
        outputGrid[ ( GRID_DIMENSION - 1 ) - Math.round( aCounter / GRID_DIMENSION ) * 2 ][ ( aCounter % ( GRID_DIMENSION / 2 ) ) * 2 ] = ".";
    }

    // Prepare the final output string.
    // The first line of the output is a fixed string.
    let resultLines = new Array( GRID_DIMENSION + 1 );
    resultLines[ 0 ] = "100 100"; // Fixed header for the output.

    // Convert each grid row array into a single string and add to the result lines.
    for ( let currentMatrixRow = 0; currentMatrixRow < GRID_DIMENSION; currentMatrixRow++ )
    {
        resultLines[ currentMatrixRow + 1 ] = outputGrid[ currentMatrixRow ].join( "" );
    }

    // Join all the result lines with newline characters to form the final output.
    var finalOutputString = resultLines.join( "\n" );

    // Print the generated grid to the console.
    console.log( '%s', finalOutputString );
}


// --- Debugging and Execution Section ---

/**
 * Executes the main processing function with user-provided input from a DOM element.
 * This function is typically used for browser-based testing or debugging.
 */
function performTestRun() {
    // Retrieve the value from an HTML input field identified by its ID.
    var testInputValue = document.querySelector( "#inputField" ).value;
    // Pass the retrieved value to the primary processing function.
    processInputData( testInputValue );
}

// Automatically execute the main function by reading input from standard input (e.g., in a Node.js environment).
// This line ensures the script runs when executed via `node script.js < input.txt`.
processInputData( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf-8' ) );