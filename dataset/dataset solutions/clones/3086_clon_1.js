/*
 * Global variable N, initialized to zero.
 * This variable will store the size of the grid or boundary for tile movements.
 */
var N = 0;

/*
 * Main function to process the input and calculate the final state of tiles.
 * @param {string} input - The raw input string from stdin.
 */
function     Main (  input ) {

    // Split the input string into an array of lines.
    const args      =   input.split('\n');

    // The first line contains N (grid size) and Q (number of queries),
    // but only N is used here.
    const NQ        =   args[0].split(' ');
    N               =   parseInt(NQ[0]); // Parse N from the first part of the first line.

    // searchIndex will store arrays of initial positions for each character (tile type).
    const searchIndex   =   {};

    // tiles array will represent the count of tiles at each position.
    // Initially, each position where a tile exists will have a count of 1.
    var tiles       =   [];


    // Initialize tiles based on the second line of input (initial tile positions).
    for ( var i = 0; i < args[1].length; i++ ) {

        var ch          =   args[1][i]; // Get the character at the current position.
        tiles[i]        =   1;          // Mark this position as having 1 tile.

        // If this character hasn't been seen before, initialize its index array.
        if ( !searchIndex[ch] ) {
            searchIndex[ch] =   [];
        }

        // Add the current position to the list of indices for this character.
        searchIndex[ch].push(i);
    }



    // Process subsequent lines as movement queries.
    // Queries start from the third line (index 2).
    for ( var i = 2; i < args.length; i++ ) {

        // Each query line contains a tile character 't' and a direction 'd'.
        var td          =   args[i].split(' ');
        var t           =   td[0];          // The character of the tile to move.
        var idx         =   searchIndex[t]; // Get all current indices of this tile type.

        // If there are no tiles of this type, skip this query.
        if ( !idx ) {
            continue;
        }

        var d           =   td[1];          // The direction ('L' for left, 'R' for right).

        // If direction is 'R' (Right), move tiles from right to left to avoid
        // issues with shifting indices within the same movement pass.
        if ( d === "R" ) {

            // Iterate backwards through the indices of the current tile type.
            for ( var j = ( idx.length - 1 ); j >= 0; j-- ) {
                move(tiles, idx[j], 1); // Move right (direction = +1).
            }
        }
        // If direction is 'L' (Left).
        else {

            // Iterate forwards through the indices of the current tile type.
            for ( var k = 0; k < idx.length; k++ ) {
                move(tiles, idx[k], -1); // Move left (direction = -1).
            }
        }
    }


    // Calculate the total sum of tiles remaining on the board.
    var sum     =   0;
    tiles.forEach( f => sum += f ); // Sum up all tile counts in the 'tiles' array.

    // Output the final sum.
    console.log(sum);
}

/*
 * Helper function to move tiles from one position to another.
 * This function updates the 'tiles' array in place.
 * @param {Array<number>} tiles     - The array representing tile counts at each position.
 * @param {number}        index     - The current index of the tile(s) to move.
 * @param {number}        direction - The direction of movement (-1 for left, 1 for right).
 */
function    move(  tiles ,  index ,  direction ) {

    // Calculate the target position.
    var to      =   index + direction;

    // Get the count of tiles at the current position.
    var count   =   tiles[index];

    // Clear the tiles from the current position.
    tiles[index]    =   0;

    // If the target position is out of bounds (less than 0 or greater than N-1),
    // the tiles fall off the board and are removed.
    if ( to < 0 || to >= N ) {
        return; // No further action needed for these tiles.
    }

    // Add the moved tiles to the target position.
    tiles[to]   +=  count;
}


// Read input from stdin and pass it to the Main function.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  );