var input = '' ; // Initialize a global variable to store all input data
// This script is designed to process standard input.
process.stdin.resume ( ) ; // Keeps the Node.js process alive while waiting for input.

process.stdin.setEncoding ( 'utf8' ) ; // Set the encoding for incoming data to UTF-8.

// Event listener for when data chunks are received from standard input.
process.stdin.on ( 'data' , function ( chunk ) {
    input += chunk ; // Append each received chunk to the 'input' variable.
} ) ;

// Event listener for when the standard input stream ends.
process.stdin.on ( 'end' , function ( ) {
    // Once all input has been received, call the main function with the collected input.
    main ( input )
} ) ;

/**
 * The main function to process the input and solve the problem.
 * @param {string} input - The entire input string received from stdin.
 */
function main ( input ) {
    // Split the input string into lines and remove any leading/trailing whitespace.
    var args = input . trim ( ) . split ( '\n' ) ;

    var i = 0 ; // Initialize an index to iterate through the input arguments.

    // Loop indefinitely until an 'end' condition is met.
    while ( true ) {
        var map = [ ] ; // Create an empty array to represent the game map for the current test case.

        // Read the width and height (wh) of the map for the current test case.
        // The splitNum function parses the space-separated numbers.
        var wh = splitNum ( args [ i ++ ] ) ;

        // Check if the 'end' condition (0 0) has been reached.
        if ( isEnd ( wh ) ) {
            break ; // If it's the end marker, exit the loop.
        }

        // Initialize the map with dimensions read from 'wh'.
        initMap ( wh , map ) ;

        // Read the starting coordinates (startXY) for the pathfinding.
        var startXY = splitNum ( args [ i ++ ] ) ;
        // Read the goal coordinates (goalXY) for the pathfinding.
        var goalXY = splitNum ( args [ i ++ ] ) ;

        // Read the number of blocks to be placed on the map.
        var blockCount = parseInt ( args [ i ++ ] ) ;

        // Loop to place each block on the map.
        for ( var j = 0 ; j < blockCount ; j += 1 ) {
            // Read block details (type, orientation, x, y).
            var block = splitNum ( args [ i ++ ] ) ;
            putBlock ( map , block ) ; // Place the block onto the map.
        }

        // Determine if the goal is reachable from the start position.
        // Coordinates are 1-indexed in input, convert to 0-indexed for array access.
        var res = isReachable ( map , startXY [ 0 ] - 1 , startXY [ 1 ] - 1 , goalXY [ 0 ] - 1 , goalXY [ 1 ] - 1 ) ;

        // Output the result: "OK" if reachable, "NO" otherwise.
        console . log ( res ? "OK" : "NO" ) ;
    }
}

/**
 * Initializes a 2D map array with given width and height.
 * All cells are initialized to 0 (representing empty space).
 * @param {number[]} wh - An array [width, height] for the map dimensions.
 * @param {number[][]} map - The 2D array representing the map to be initialized.
 */
function initMap ( wh , map ) {
    // Loop through rows (x-coordinate).
    for ( var x = 0 ; x < wh [ 0 ] ; x += 1 ) {
        var buff = [ ] ; // Temporary buffer for the current row.
        // Loop through columns (y-coordinate).
        for ( var y = 0 ; y < wh [ 1 ] ; y += 1 ) {
            buff . push ( 0 ) ; // Add a '0' to represent an empty cell.
        }
        map . push ( buff ) ; // Add the completed row to the map.
    }
}

/**
 * Places a block onto the map. Blocks have specific dimensions and a color.
 * @param {number[][]} map - The 2D map array.
 * @param {number[]} block - An array [color, orientation, x, y] describing the block.
 *                           orientation: 0 for horizontal, 1 for vertical.
 */
function putBlock ( map , block ) {
    var isHorizontal = ! block [ 1 ] ; // Determine if the block is horizontal (0) or vertical (1).

    // Define block width (bw) and block height (bh) based on orientation.
    // Horizontal blocks: 4x2, Vertical blocks: 2x4.
    var bw = isHorizontal ? 4 : 2 ;
    var bh = isHorizontal ? 2 : 4 ;

    // Convert block's top-left coordinates from 1-indexed to 0-indexed.
    var x = block [ 2 ] - 1 ;
    var y = block [ 3 ] - 1 ;

    // Loop through the cells covered by the block.
    for ( var mx = x ; mx < x + bw ; mx += 1 ) {
        for ( var my = y ; my < y + bh ; my += 1 ) {
            map [ mx ] [ my ] = block [ 0 ] ; // Set the cell's value to the block's color.
        }
    }
}

/**
 * Checks if a path exists from the current position to the goal position on the map.
 * This is a recursive depth-first search implementation.
 * @param {number[][]} map - The 2D map array.
 * @param {number} nowX - Current X-coordinate.
 * @param {number} nowY - Current Y-coordinate.
 * @param {number} goalX - Goal X-coordinate.
 * @param {number} goalY - Goal Y-coordinate.
 * @returns {boolean} - True if the goal is reachable, false otherwise.
 */
function isReachable ( map , nowX , nowY , goalX , goalY ) {
    // Base case: If current position is the goal, we've found a path.
    if ( nowX === goalX && nowY === goalY ) {
        return true ;
    }

    // Get the color of the current cell.
    var color = map [ nowX ] [ nowY ] ;
    // Mark the current cell as visited by changing its value to -2.
    // This prevents infinite loops in recursive calls.
    map [ nowX ] [ nowY ] = -2 ;

    var flag = false ; // Flag to track if any path from this point leads to the goal.

    // Iterate over possible dx values for diagonal movement.
    [ -1 , 1 ] . forEach ( function ( dx ) {
        // Iterate over possible dy values for diagonal movement.
        [ -1 , 1 ] . forEach ( function ( dy ) {
            var cx = nowX + dx , cy = nowY + dy ; // Calculate new coordinates.

            // Check if the new coordinates are within map bounds and if the cell has the same color.
            // Also ensures the cell hasn't been visited (-2) or is not an invalid value.
            if ( map [ cx ] && map [ cx ] [ cy ] === color ) {
                // Recursively call isReachable for the new cell.
                // If any recursive call returns true, set flag to true.
                flag = flag || isReachable ( map , cx , cy , goalX , goalY ) ;
            }
        } )
    } ) ;
    return flag ; // Return the result.
}

/**
 * Splits a string by space and converts each part to a number.
 * @param {string} str - The input string, e.g., "10 20".
 * @returns {number[]} - An array of numbers, e.g., [10, 20].
 */
function splitNum ( str ) {
    return str . split ( ' ' ) . map ( Number ) ;
}

/**
 * Checks if an array represents the end condition (typically [0, 0]).
 * @param {number[]} arr - An array of two numbers.
 * @returns {boolean} - True if both elements are 0, false otherwise.
 */
function isEnd ( arr ) {
    return arr [ 0 ] === 0 && arr [ 1 ] === 0 ;
}