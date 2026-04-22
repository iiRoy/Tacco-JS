'use strict' /* This directive enables strict mode for the entire script. */

// --- Main function definition ---
const main = arg => {
    /*
     * Helper function to generate binary numbers within a specified range,
     * maintaining a constant bit count (number of '1's).
     *
     * @param {string} _min - The minimum binary string (e.g., "001").
     * @param {string} _max - The maximum binary string (e.g., "100").
     * @returns {Array<string>} An array of binary strings matching the criteria.
     */
    const getBinary = ( _min , _max ) => {

        // Calculate the required number of '1' bits from the minimum binary string.
        const bitCount = ( _min.match(/1/g) || [ ] ).length;

        // Convert binary strings to integers for iteration.
        var min = parseInt( _min, 2 );
        var max = parseInt( _max, 2 );

        // Array to store the resulting binary strings.
        var binary = [];
        
        // Loop from min integer to max integer.
        for ( let i = min ; i <= max ; i++ ) {

            // Convert current integer to its binary string representation.
            var theBinary = ( i ).toString( 2 );

            // Check if the current binary string has the required bit count.
            if ( bitCount !== ( theBinary.match(/1/g) || [ ] ).length ) {
                // If not, skip to the next iteration.
                continue;
            }

            // Pad the binary string with leading zeros to match the maximum length.
            var zeros = [ ...Array( _max.length - theBinary.length ) ].map( obj => "0" ).join( "" );
            
            // Add the zero-padded binary string to the results array.
            binary.push( zeros + theBinary );
        }

        // Return the collected binary patterns.
        return binary;
    }

    // --- Input processing section ---
    // Remove leading/trailing whitespace and split the input by newlines.
    const input = arg . trim() . split( "\n" );

    // Parse the first line of input to get goal dimensions (height, width).
    // Example: "2 3" -> [2, 3]
    const goal = input[0] . split( " " ) . map( obj => parseInt( obj, 10 ) ); // [2, 3]; (h, w) 1~

    // Extract the map rows from the input, excluding the first line.
    const maps = input . slice( 1 ) . slice( 0, goal[0] );

    // Initialize the maps, slicing each row to the specified width.
    // NOTE: There appears to be a syntax error in the original code's map function.
    // It has `(col1.slice(0, goal[1]);` which is not valid JavaScript syntax.
    // As per Type I cloning rules, this must be preserved exactly.
    const initMaps = maps.map( col1 => 
        (col1.slice(0, goal[1]); // This line is exactly as provided in the original code.
    ); //.split("").map(col2 => col2 === "." ? 1 : 0)) // Original commented part.

    // Variable to store the minimum count of '#' encountered.
    var result;

    // Calculate the required number of steps for horizontal and vertical routes.
    const routeH = goal[0] - 1; // Number of '1's (down moves)
    const routeW = goal[1] - 1; // Number of '0's (right moves)

    // Generate the minimum binary string: all '0's (right) then all '1's (down).
    var minBinary = [ ...Array( routeW ) ].map( obj => "0" ).join( "" ) + [ ...Array( routeH ) ].map( obj => "1" ).join( "" );

    // Generate the maximum binary string by reversing the minimum binary string.
    // This represents all '1's (down) then all '0's (right).
    var maxBinary = minBinary . split( "" ) . reverse() . join( "" );

    // Get all valid binary patterns representing possible routes.
    // These patterns will have a fixed number of '1's (routeH) and '0's (routeW).
    const patterns = getBinary( minBinary, maxBinary );

    // --- Route traversal and counting loop ---
    // Iterate through each generated binary pattern (each possible route).
    for ( var i = 0 ; i < patterns.length ; i++ ) {

        var count = 0; // Counter for '#' obstacles encountered on the current route.
        var cur_x = 0; // Current horizontal position (column).
        var cur_y = 0; // Current vertical position (row).

        // Check the starting position.
        if ( initMaps[cur_y][cur_x] === "#" ) {
            count++;
        }

        // Traverse the map based on the current binary pattern.
        // '1' means move down (y++), '0' means move right (x++).
        for ( let j = 0 ; j < patterns[i].length ; j++ ) {
            if ( patterns[i][j] === "1" ) {
                cur_y++; // Move down.
            } else {
                cur_x++; // Move right.
            }
            
            // If the current cell contains an obstacle.
            if ( initMaps[cur_y][cur_x] === "#" ) { 
                count++; // Increment obstacle count.
                // Optimization: If current count already exceeds or equals the best result found so far,
                // there's no need to continue this path; break and check the next pattern.
                if ( result && count >= result ) {
                    break;
                }
            }            
        }

        // Update the overall minimum obstacle count.
        // If 'result' is not yet set, or if the current route's 'count' is better.
        if ( result !== 0 && ( !result || result > count ) ) { 
            result = count; // Store the new minimum.
            // Optimization: If a route with zero obstacles is found, it's the best possible,
            // so we can stop searching.
            if ( count === 0 ) {
                break;
            }
        }
    }

    // Output the final minimum obstacle count.
    console.log( result );
}

// Read input from stdin and pass it to the main function.
main( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );