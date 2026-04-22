/*
 * This file contains the main logic for processing grid-based input
 * and performing a search operation to find the minimum number of 'warps'
 * required to reach a goal from a starting point within a grid.
 *
 * This implementation uses a variation of Breadth-First Search (BFS)
 * where direct moves (no warp) are prioritized over warp moves.
 *
 * Author: Automated Code Clone Generator
 * Date: 2023-10-27 (Example Date)
 */

function   Main (   input   )
{
    // Step 1: Parse the initial input string into an array of lines.
    const   lines   =   input . split (   '\n'   ) ;


    // Step 2: Extract grid dimensions (Height and Width) from the first line.
    // The values are space-separated and need to be converted to integers.
    const   HW   =   lines [ 0 ] . split ( ' ' ) . map (   i   =>   parseInt ( i )   ) ;


    // Step 3: Extract starting coordinates (S_row, S_col) from the second line.
    // These are also space-separated integers.
    const   S   =   lines [ 1 ] . split ( ' ' ) . map (   i   =>   parseInt ( i )   ) ;


    // Step 4: Extract goal coordinates (G_row, G_col) from the third line.
    // Again, space-separated integers.
    const   G   =   lines [ 2 ] . split ( ' ' ) . map (   i   =>   parseInt ( i )   ) ;


    // Step 5: Process the remaining lines to construct the grid map (M).
    // `splice` removes lines from the `lines` array starting from index 3.
    // Each remaining line (row) is then split into individual characters.
    const   M   =   lines . splice ( 3 , HW [ 0 ] ) . map (   r   =>
    {
        return   r . split ( '' ) ;
    } ) ;


    // Step 6: Initialize the queue for the search algorithm.
    // The queue will store items in the format: [[row, col], numWarps].
    const   queue   =   [ ] ;


    /*
     * Helper function: s1
     * This function appears to be an alternative or partial exploration strategy.
     * It processes direct adjacent moves and updates the grid with the current warp count.
     * It's defined but not directly called in the main search loop in this particular code structure.
     * It primarily handles marking cells with the current warp count if they are unvisited
     * and adding their direct neighbors to the queue.
     */
    const   s1   =   (   pos ,   nWarp   )   =>
    {
        const   r   =   pos [ 0 ] ; // Row coordinate from the position array.
        const   c   =   pos [ 1 ] ; // Column coordinate from the position array.

        // Check for out-of-bounds conditions for the current cell.
        if   (   r   <   0   ||   HW [ 0 ]   -   1   <   r   ||   c   <   0   ||   HW [ 1 ]   -   1   <   c   )
        {
            return ; // If out of bounds, terminate this path exploration.
        }

        // Retrieve the current value/score stored at grid position M[r][c].
        const   currentSocre   =   M [ r ] [ c ] ;

        // If the cell is a wall ('#') or has already been visited with an equal
        // or better (lower) warp count, there's no need to process it again.
        if   (   currentSocre   ===   '#'   ||   currentSocre   <=   nWarp   )
        {
            return ;
        }
        else // This block executes if currentSocre is '.' (unvisited and not a wall).
        {
            // Mark the cell with the current number of warps used to reach it.
            M [ r ] [ c ]   =   nWarp ;

            // Add all four direct neighbors to the queue for further exploration.
            // These moves do not increment the warp count.
            queue . push (   [ [ r   +   1 ,   c ] ,   nWarp ]   ) ;
            queue . push (   [ [ r   -   1 ,   c ] ,   nWarp ]   ) ;
            queue . push (   [ [ r ,   c   +   1 ] ,   nWarp ]   ) ;
            queue . push (   [ [ r ,   c   -   1 ] ,   nWarp ]   ) ;
        }
    }


    /*
     * Core search function: `search`
     * This function implements the main logic for exploring the grid.
     * It prioritizes direct moves (added to the front of the queue)
     * and considers 'warp' moves (added to the back of the queue, incrementing warp count).
     */
    const   search   =   (   pos ,   nWarp   )   =>
    {
        const   r   =   pos [ 0 ] ; // Extract row coordinate.
        const   c   =   pos [ 1 ] ; // Extract column coordinate.

        // Perform boundary checks to ensure the position is within the grid.
        if   (   r   <   0   ||   HW [ 0 ]   -   1   <   r   ||   c   <   0   ||   HW [ 1 ]   -   1   <   c   )
        {
            return ; // If out of bounds, stop processing.
        }

        // Get the current content or value of the cell at [r][c].
        const   currentSocre   =   M [ r ] [ c ] ;

        // If the cell is a wall, we cannot move through it.
        if   (   currentSocre   ===   '#'   )
        {
            return ;
        }
        else   if   (   currentSocre   ===   '.'   ) // If the cell is unvisited (represented by '.').
        {
            // Mark the cell with the current warp count.
            M [ r ] [ c ]   =   nWarp ;

            // Add direct neighbors to the *front* of the queue.
            // This simulates a BFS for paths with the same warp count,
            // effectively exploring all direct paths before considering new warps.
            queue . unshift (   [ [ r   +   1 ,   c ] ,   nWarp ]   ) ;
            queue . unshift (   [ [ r   -   1 ,   c ] ,   nWarp ]   ) ;
            queue . unshift (   [ [ r ,   c   +   1 ] ,   nWarp ]   ) ;
            queue . unshift (   [ [ r ,   c   -   1 ] ,   nWarp ]   ) ;

            // Explore 'warp' moves: consider all cells within a 5x5 square
            // centered at the current position (excluding the immediate 3x3 square).
            // These moves increment the warp count and are added to the *back* of the queue.
            for   (   let   h   =   -2 ;   h   <   3 ;   h ++   )
            {
                for   (   let   w   =   -2 ;   w   <   3 ;   w ++   )
                {
                    queue . push (   [ [ r   +   h ,   c   +   w ] ,   nWarp   +   1 ]   ) ;
                }
            }
        }
        // If 'currentSocre' is already a number, it means this cell has been visited
        // with a certain number of warps. The logic here only processes '.' cells,
        // so if it's already a number, it's effectively skipped unless a better path
        // (fewer warps) can be found, which would replace the existing number.
        // However, with the `unshift` for direct moves, this ensures the shortest path
        // for a given warp count is found first.
    }


    // Step 7: Initialize the queue with the starting position.
    // Input coordinates are 1-indexed, so subtract 1 for 0-indexed arrays.
    // The starting point requires 0 warps.
    queue . push (   [ [ S [ 0 ]   -   1 ,   S [ 1 ]   -   1 ] ,   0 ]   ) ;


    // Step 8: Main loop for the search algorithm.
    // Continues as long as there are items in the queue to process.
    while   (   queue . length   !==   0   )
    {
        // Dequeue the next item (position and warp count) to explore.
        const   item   =   queue . shift ( ) ;

        // Call the search function to process the dequeued item.
        search (   item [ 0 ] ,   item [ 1 ]   ) ;

        // Optimization: If the goal cell has been reached (i.e., its value is no longer '.'),
        // it means we've found the shortest path to it. We can terminate the search early.
        if   (   M [ G [ 0 ]   -   1 ] [ G [ 1 ]   -   1 ]   !==   '.'   )
        {
            break ;
        }
    }


    // Step 9: Output the final result.
    // Check if the goal cell (M[G[0]-1][G[1]-1]) was reached (i.e., its value is not '.').
    // If reached, print the warp count stored in that cell.
    // If not reached (still '.'), print -1 to indicate it's unreachable.
    console . log (   M [ G [ 0 ]   -   1 ] [ G [ 1 ]   -   1 ]   !==   '.'   ?   M [ G [ 0 ]   -   1 ] [ G [ 1 ]   -   1 ]   :   -1   ) ;
}


// Step 10: Read input from standard input and execute the Main function.
// This line typically runs in a Node.js environment.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;