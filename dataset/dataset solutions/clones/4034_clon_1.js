'use strict' ; /* This JavaScript code implements a Breadth-First Search (BFS) algorithm
                                 to find the shortest path in a grid. It reads grid data from standard
                                 input, initializes a map, and then traverses it to determine the path
                                 from a starting point (1,1) to an end point (W,H). */


console . log ( function ( args ) {

    // Step 1: Process the input string.
    // The input 'args' is expected to be a multi-line string.
    const tmp = args . trim ( ) . split ( '\n' ) ; // Remove leading/trailing whitespace and split by newline.

    // Step 2: Parse grid dimensions (Height H and Width W) from the first line.
    // The first line `tmp[0]` contains two space-separated integers.
    // `v|0` is a compact way to convert a string to an integer (bitwise OR with 0).
    const HW = tmp [ 0 ] . split ( ' ' ) . map ( v => v | 0 ) ;

    // Assign parsed dimensions to H and W.
    const H = HW [ 0 ] , W = HW [ 1 ] ;

    // Step 3: Initialize the grid map.
    // Create a 2D array 'map' to represent the grid.
    // It's padded with 'Infinity' on all sides to simplify boundary checks.
    const map = [ Array ( W + 2 ) . fill ( Infinity ) ] ; // Top border row.

    // 's' will count the number of traversable cells ('.') in the input grid.
    let s = 0 ;

    // Populate the map based on the input, adding 'Infinity' borders.
    for ( let y = 1 ; y <= H ; y ++ ) { // Iterate through rows (1 to H, excluding borders).
        map . push ( [ Infinity ] ) ; // Add left border for current row.

        for ( let x = 0 ; x < W ; x ++ ) { // Iterate through columns (0 to W-1).
            // If the cell in the input is '.', it's traversable (value 0 in map).
            if ( tmp [ y ] [ x ] === '.' ) {
                s ++ ;                     // Increment traversable cell count.
                map [ y ] . push ( 0 ) ;   // Mark as traversable and unvisited.
            } else {
                map [ y ] . push ( Infinity ) ; // Otherwise, it's an obstacle (Infinity).
            }
        }
        map [ y ] . push ( Infinity ) ; // Add right border for current row.
    }
    map . push ( Array ( W + 2 ) . fill ( Infinity ) ) ; // Bottom border row.

    // Step 4: Define movement directions for BFS.
    // These represent [delta_x, delta_y] for up, left, down, right.
    const dir = [ [ - 1 , 0 ] , [ 0 , - 1 ] , [ 1 , 0 ] , [ 0 , 1 ] ] ;

    // Step 5: Initialize the BFS queue.
    // The queue stores [x, y, path_length].
    // Starting point is (1,1) with an initial path length of 2 (assuming 1-based indexing for path).
    const queue = [ [ 1 , 1 , 2 ] ] ;

    // Step 6: Perform BFS.
    do {
        // Dequeue the current cell's information.
        const q = queue . shift ( ) ;

        // Explore all four possible directions from the current cell.
        for ( const d of dir ) {
            // Calculate the coordinates of the next cell.
            const x = q [ 0 ] + d [ 0 ] , y = q [ 1 ] + d [ 1 ] ;

            // Check if the destination (W, H) has been reached.
            if ( x === W && y === H ) return s - q [ 2 ] ; // If so, return the result.

            // If the next cell is traversable (value 0, meaning unvisited and not an obstacle).
            if ( map [ y ] [ x ] === 0 ) {
                // Mark the cell with the current path length + 1.
                map [ y ] [ x ] = q [ 2 ] + 1 ;
                // Enqueue the next cell with its updated path length.
                queue . push ( [ x , y , q [ 2 ] + 1 ] ) ;
            }
        }
    } while ( queue [ 0 ] ) ; // Continue as long as the queue is not empty.

    // This immediately invoked function expression (IIFE) calls itself
    // with the content of '/dev/stdin' as its argument.
} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ;