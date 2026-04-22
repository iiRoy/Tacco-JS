/*
 * Application configuration variables.
 * These will store values parsed from standard input.
 */
var input = {};

/*
 * This is a two-dimensional array representing the grid structure.
 * Each element can be:
 *   -1: Indicates a horizontal bar to the right.
 *    0: No bar.
 *    1: Indicates a horizontal bar to the left.
 */
var data = [];


/*
 * Function 'f' calculates a path from a given starting point.
 *
 * @param {number} startLine The initial vertical position (line index).
 * @param {number} [startStep=0] The initial horizontal position (step index), defaults to 0.
 * @returns {Array<number>} An array of numbers representing the path taken,
 *                          where each element is the line index at that step.
 */
var f = function ( startLine, startStep ) {

    // Ensure startStep is initialized if not provided.
    if ( !startStep ) {
        startStep = 0;
    }

    var now = startLine; // Current line position.
    var result = [ now ]; // Initialize path with the starting position.

    // Iterate through the grid steps from startStep to the end of data.
    for ( var y = startStep; y < data.length; y++ ) {

        // Update the current line based on the data at the current step and line.
        now += data[ y ][ now ];

        // Add the new position to the result path.
        result.push( now );
    }

    return result; // Return the complete path.
};

/*
 * Function 'rf' calculates a path in reverse, starting from an end line.
 * This effectively traces the path from the end back to the start.
 *
 * @param {number} endLine The target end line from which to trace back.
 * @returns {Array<number>} An array representing the path from the inferred start
 *                          to the specified end, in correct chronological order.
 */
var rf = function ( endLine ) {

    var now = endLine; // Current line position, starting from the end.
    var result = [ now ]; // Initialize path with the end position.

    // Iterate backwards through the grid steps.
    for ( var y = data.length - 1; y >= 0; y-- ) {

        // Update the current line based on the data.
        // Note: The logic for 'now' is the same as 'f', but the iteration is reversed.
        now += data[ y ][ now ];

        result.push( now ); // Add the position to the result.
    }

    // Reverse the array to get the path from start to end.
    return result.reverse();
};


// Array to store lines read from standard input.
var lines = [];

// Resume stdin to begin listening for input.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding( 'utf8' );

// Event listener for incoming data chunks from stdin.
process.stdin.on( 'data', function ( chunk )
{
    // Process each line in the chunk.
    chunk.trim().split( '\n' ).forEach( function ( line ) {
        lines.push( line ); // Add the processed line to the 'lines' array.
    } );
} );


// Event listener for the 'end' of standard input.
process.stdin.on( 'end', function () {

    // Initialize the final result string.
    var result = "";

    // --- Data processing and initialization ---

    // Reset input and data structures for a new run.
    input = {};
    data = [];

    // Loop through each line read from stdin.
    for ( var i = 0; i < lines.length; i++ ) {

        var e = lines[ i ]; // Current line content.

        // If '0' is encountered, it signifies the end of configuration/data input.
        if ( e == "0" ) {
            break;
        }

        // Define expected configuration keys.
        def = [ "lines", "start", "end", "steps" ];

        // Populate initial configuration values from the first few lines.
        if ( i < def.length ) {
            input[ def[ i ] ] = parseInt( e ); // Parse and assign integer value.
            return; // Skip further processing for this line as it's a config value.
        }

        // For lines after the initial configuration (i.e., i >= def.length, which is 4 in this case).
        // These lines contain the grid data.
        var line = []; // Initialize an array to store the current grid row.

        // Process characters of the current line to build the grid row.
        // input.lines-1 because the last element is derived.
        for ( var j = 0; j < input.lines - 1; j++ ) {

            var c = parseInt( e.charAt( j ) ); // Parse character as integer.

            // Special handling for specific bar configurations.
            // If current char is 0 and previous was 1, it implies -1.
            if ( j > 0 && c == 0 && line[ j - 1 ] == 1 ) {
                c = -1;
            }

            line.push( c ); // Add the processed value to the current row.
        }

        // Determine the last element of the row based on the preceding element.
        // If the last element processed was 1, the final element is -1, otherwise 0.
        line.push( ( line[ line.length - 1 ] == 1 ) ? -1 : 0 );

        data.push( line ); // Add the completed row to the main 'data' grid.
    }

    // Adjust 'start' and 'end' values to be zero-indexed.
    input.start -= 1;
    input.end -= 1;

    // --- Pathfinding and comparison ---

    // Calculate the path from the specified start point.
    var route = f( input.start );

    // Check if the end of the calculated route matches the target end.
    if ( route[ route.length - 1 ] == input.end ) {
        console.log( "0" ); // If they match, output "0" (no steps needed) and exit.
        return;
    }

    // Calculate the reverse path from the specified end point.
    var gRoute = rf( input.end );

    // Iterate through the steps to find a meeting point or a conflict.
    for ( var y = 0; y < input.steps; y++ ) {

        // Check for conditions indicating a possible "swap" or collision point:
        // 1. The absolute difference between current positions in both routes is 1 (they are adjacent).
        // 2. Both positions on the grid at step 'y' have no horizontal bars (data[y][pos] == 0).
        if ( Math.abs( route[ y ] - gRoute[ y ] ) == 1 && data[ y ][ route[ y ] ] == 0 && data[ y ][ gRoute[ y ] ] == 0 ) {

            // If conditions met, calculate the result string.
            // (y+1) for 1-indexed step, (Math.min(...) + 1) for 1-indexed column.
            result = ( y + 1 ) + " " + ( Math.min( route[ y ], gRoute[ y ] ) + 1 );
            break; // Exit loop after finding the first such point.
        }
    }

    // If no such point was found (result remains empty), default to "1".
    if ( result == "" ) {
        result = "1";
    }

    // Output the final computed result.
    console.log( result );
} );