'use strict';

// This is the main function that orchestrates the entire process.
// It takes 'arg' as input, which is expected to be the raw input string.
const main = arg => {

    // Helper function to generate binary strings within a specified range.
    // It also filters these binary strings based on a fixed count of '1' bits.
    const getBinary = ( _min, _max ) => {

        // Calculate the required number of '1' bits from the minimum binary string provided.
        const bitCount = ( _min.match( /1/g ) || [ ] ).length;

        // Convert the binary string representations of _min and _max into integers
        // to facilitate numerical iteration.
        var min = parseInt( _min, 2 );
        var max = parseInt( _max, 2 );

        // Initialize an empty array to store the binary strings that meet our criteria.
        var binary = [ ];

        // Iterate through all integer values from 'min' up to 'max', inclusive.
        for ( let i = min; i <= max; i++ ) {

            // Convert the current integer 'i' back into its binary string representation.
            var theBinary = ( i ).toString( 2 );

            // Check if the current binary string 'theBinary' has the same number of '1' bits
            // as determined by 'bitCount'. If not, this binary string is skipped.
            if ( bitCount !== ( theBinary.match( /1/g ) || [ ] ).length ) {
                continue; // Move to the next iteration of the loop.
            }

            // Calculate the number of leading zeros needed to pad 'theBinary'
            // so its length matches that of '_max' (the longest possible binary string).
            var zeros = [ ...Array( _max.length - theBinary.length ) ].map( obj => "0" ).join( "" );

            // Prepend the calculated leading zeros to 'theBinary' and add the result
            // to our 'binary' array.
            binary.push( zeros + theBinary );
        }

        // Return the array containing all generated and filtered binary strings.
        return binary;
    }


    // Pre-process the input argument: trim any leading/trailing whitespace,
    // then split the string into an array of lines based on newline characters.
    const input = arg.trim( ).split( "\n" );

    // Parse the first line of the input to extract the goal dimensions (height and width).
    // These dimensions are 1-indexed in the problem description.
    const goal = input[ 0 ].split( " " ).map( obj => parseInt( obj, 10 ) ); // Example: [2, 3] for (height, width)

    // Initialize the game map from the input.
    // The map is represented as a 2D array where '1' denotes a path ('.')
    // and '0' denotes a wall ('#').
    const initMaps = input.slice( 1 ) // Skip the first line (dimensions).
                           .filter( ( obj, l ) => l < goal[ 0 ] ) // Only process rows up to the specified height.
                           .map( ( col1, i ) => {
                               // For each relevant input line (row string),
                               // split it into individual characters and convert them.
                               return ( col1.split( "" )
                                            .filter( ( obj, m ) => m < goal[ 1 ] ) // Only process columns up to the specified width.
                                            .map( col2 => col2 === "." ? 1 : 0 ) ); // Convert '.' to 1, '#' to 0.
                           } );


    // This variable will store the minimum number of walls encountered across all valid paths.
    var result;

    // Calculate the number of required moves in the vertical (down) direction
    // and horizontal (right) direction to reach the target cell (0-indexed).
    const routeH = goal[ 0 ] - 1; // Number of '1's in a path (down moves).
    const routeW = goal[ 1 ] - 1; // Number of '0's in a path (right moves).

    // Construct the binary string representing the path that prioritizes moving right first.
    // This path is composed of all '0's (right moves) followed by all '1's (down moves).
    var minBinary = [ ...Array( routeW ) ].map( obj => "0" ).join( "" )
                  + [ ...Array( routeH ) ].map( obj => "1" ).join( "" );

    // Construct the binary string representing the path that prioritizes moving down first.
    // This path is composed of all '1's (down moves) followed by all '0's (right moves).
    var maxBinary = [ ...Array( routeH ) ].map( obj => "1" ).join( "" )
                  + [ ...Array( routeW ) ].map( obj => "0" ).join( "" );

    // Generate all possible valid movement patterns (binary strings) between minBinary and maxBinary.
    // Each '0' represents a move to the right, and each '1' represents a move downwards.
    const patterns = getBinary( minBinary, maxBinary );

    // Iterate through each generated path pattern to evaluate its wall count.
    patterns.forEach( ( obj, l ) => {

        // Split the current binary path string into an array of individual movement steps.
        const theRoute = obj.split( "" );

        // Initialize a counter for walls and the current coordinates (x, y) for this path.
        var count = 0;
        var cur_x = 0;
        var cur_y = 0;

        // Check if the starting cell itself is a wall. If so, increment the wall count.
        if ( initMaps[ cur_y ][ cur_x ] === 0 ) {
            count++;
        }

        // Traverse the map according to the sequence of moves in 'theRoute'.
        theRoute.forEach( next => {
            // If the next step is '1', move down (increment y-coordinate).
            if ( next === "1" ) {
                cur_y++;
            }
            // Otherwise (if '0'), move right (increment x-coordinate).
            else {
                cur_x++;
            }
            // After moving, check if the new cell is a wall. If so, increment the wall count.
            if ( initMaps[ cur_y ][ cur_x ] === 0 ) {
                count++;
            }
        } );

        // Update the 'result' if the current path's wall count is lower than the previously
        // recorded minimum, or if 'result' has not been set yet.
        // The condition `result !== 0` handles cases where 0 walls is a valid minimum.
        if ( result !== 0 && ( !result || result > count ) ) {
            result = count;
        }
    } );

    // Print the final minimum number of walls found among all valid paths to standard output.
    console.log( result );
}

// Read the input from standard input asynchronously and then pass it to the main function.
// The input is read as UTF-8 encoded text.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );