/* This is the main function of the program.
 * It takes a string 'input' as its argument, typically read from standard input.
 * The purpose of this function is to find the minimum number of 'warps'
 * required to travel from a starting point 'S' to a goal point 'G' on a grid 'M'.
 * Warps allow jumping within a 5x5 area at the cost of one extra warp.
 * Regular movement (up, down, left, right) does not cost extra warps.
 */
function Main ( input ) {


    // Split the input string into an array of lines.
    const lines = input .split( '\n' ) ;


    // Parse the first line to get Height (H) and Width (W) of the grid.
    const HW = lines [ 0 ] .split( ' ' ) .map( i => parseInt( i ) ) ;


    // Parse the second line for the starting coordinates (S_row, S_col).
    // These are 1-indexed in the input, so they will be adjusted later.
    const S = lines [ 1 ] .split( ' ' ) .map( i => parseInt( i ) ) ;


    // Parse the third line for the goal coordinates (G_row, G_col).
    // Also 1-indexed in the input.
    const G = lines [ 2 ] .split( ' ' ) .map( i => parseInt( i ) ) ;


    // Extract the map grid from the remaining lines.
    // lines.splice(3, HW[0]) gets HW[0] lines starting from index 3.
    // Each row 'r' is then split into individual characters to form the grid.
    const M = lines .splice( 3 , HW [ 0 ] ) .map( r => {

        return r .split( '' ) ;

    } ) ;


    // Initialize a queue for Breadth-First Search (BFS).
    // Each item in the queue will be an array: [[row, col], numberOfWarps].
    const queue = [ ] ;


    /**
     * Defines the search function, which explores adjacent cells and potential warp targets.
     * It updates the grid M with the minimum warps needed to reach a cell.
     * @param {Array<number>} pos - The current position [row, col].
     * @param {number} nWarp - The number of warps taken to reach 'pos'.
     */
    const search = ( pos , nWarp ) => {

        // Extract row from position.
        const r = pos [ 0 ] ;

        // Extract column from position.
        const c = pos [ 1 ] ;


        // Check if the current position is out of bounds of the grid.
        if ( r < 0 || HW [ 0 ] - 1 < r || c < 0 || HW [ 1 ] - 1 < c ) {

            return ; // If out of bounds, stop this branch of exploration.
        }


        // Get the current cell's value from the map M.
        // This value could be '.', '#', or a number representing warps.
        const currentSocre = M [ r ] [ c ] ;


        // If the cell is a wall ('#'), we cannot pass through it.
        if ( currentSocre === '#' ) {

            return ; // Stop exploring from this wall cell.

        } else if ( currentSocre === '.' || currentSocre > nWarp ) {
            // This condition is true if:
            // 1. The cell is unvisited ('.').
            // 2. We have found a path to this cell using fewer warps than previously recorded.

            // Update the cell with the current number of warps.
            // This effectively marks the cell as visited with nWarp cost.
            M [ r ] [ c ] = nWarp ;


            // Add adjacent cells (up, down, left, right) to the queue.
            // These movements do not increase the warp count.
            queue .push( [ [ r + 1 , c ] , nWarp ] ) ;

            queue .push( [ [ r - 1 , c ] , nWarp ] ) ;

            queue .push( [ [ r , c + 1 ] , nWarp ] ) ;

            queue .push( [ [ r , c - 1 ] , nWarp ] ) ;


            // Explore all cells within a 5x5 square centered at (r, c) for a warp.
            // A warp always costs 1 additional warp.
            for ( let h = -2 ; h < 3 ; h++ ) {

                for ( let w = -2 ; w < 3 ; w++ ) {

                    // Enqueue the warped position with an incremented warp count.
                    // This includes the current cell itself, but it won't matter
                    // as its value is already set to nWarp and nWarp+1 > nWarp.
                    queue .push( [ [ r + h , c + w ] , nWarp + 1 ] ) ;

                }
            }
        }
    } ; // End of search function definition.


    // Initialize the queue with the starting position and 0 warps.
    // Adjusting for 0-indexed coordinates (S[0]-1, S[1]-1).
    queue .push( [ [ S [ 0 ] - 1 , S [ 1 ] - 1 ] , 0 ] ) ;


    // Perform BFS until the queue is empty, meaning all reachable cells have been processed.
    while ( queue .length !== 0 ) {

        // Dequeue the next item to process: [position, warps_to_reach_position].
        const item = queue .shift( ) ;

        // Call the search function for the dequeued item's position and warp count.
        search( item [ 0 ] , item [ 1 ] ) ;

    }


    // After BFS, print the result for the goal cell.
    // Adjusting for 0-indexed coordinates for the goal G.
    // If the goal cell M[G[0]-1][G[1]-1] is still '.', it means it's unreachable, so print -1.
    // Otherwise, print the minimum warps required to reach it, which is stored in M[G[0]-1][G[1]-1].
    console .log( M [ G [ 0 ] - 1 ] [ G [ 1 ] - 1 ] !== '.' ? M [ G [ 0 ] - 1 ] [ G [ 1 ] - 1 ] : -1 ) ;

}


// Invoke the main function with input from standard input.
// This line reads the entire content of "/dev/stdin" as a UTF-8 string.
Main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;