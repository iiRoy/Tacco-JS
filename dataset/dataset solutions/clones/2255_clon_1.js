/*
 * This JavaScript file contains the implementation for solving a maze-like problem.
 * It uses Breadth-First Search (BFS) to find the maximum distance from any starting
 * empty cell to another reachable empty cell within a grid.
 */
"use strict" ;

const main = arg => {
  // Process the input string: remove leading/trailing whitespace and split into lines.
  arg = arg.trim ( ) .split ( "\n" ) ;

  // Parse the grid dimensions H (height) and W (width) from the first line.
  const H = parseInt ( arg[0].split ( " " )[0] ) ;
  const W = parseInt ( arg[0].split ( " " )[1] ) ;

  // Create the grid (table) from the remaining lines. Each cell is a character.
  // 'slice(1, H + 1)' gets lines from index 1 up to H (inclusive).
  const table = arg.slice ( 1 , H + 1 ) .map ( n => n.split ( "" ) ) ;


  /**
   * Performs a Breadth-First Search (BFS) starting from a given (sy, sx) coordinate
   * to find the maximum distance to any reachable empty cell from this starting point.
   *
   * @param {number} sy - The starting y-coordinate (row).
   * @param {number} sx - The starting x-coordinate (column).
   * @returns {number} The maximum distance found during this BFS traversal.
   */
  const bfs = ( sy , sx ) => {
    // Define relative movements for y-coordinates (up, right, down, left).
    const dy = [ -1 , 0 , 1 , 0 ] ;
    // Define relative movements for x-coordinates (up, right, down, left).
    const dx = [ 0 , 1 , 0 , -1 ] ;

    // Initialize the visited array with -1, indicating unvisited cells.
    // Dimensions are H x W.
    let visited = [ ... Array ( H ) ] .map ( n => [ ... Array ( W ) ] .fill ( -1 ) ) ;
    // Initialize the queue for BFS.
    let que = [ ] ;
    // 'cost' variable is declared but unused in the original logic. It can be removed or kept as is. I will keep it.
    let cost = 0 ; /* This variable is not utilized in the current BFS logic. */
    // Initialize the answer for this specific BFS run.
    let answer = 0 ;

    // Add the starting point to the queue and mark it as visited with distance 0.
    que.push ( [ sy , sx ] ) ;
    visited[sy][sx] = 0 ;

    // Continue BFS as long as there are elements in the queue.
    while ( que.length > 0 ) {
      // Dequeue the current position (p).
      const p = que.shift ( ) ;

      // Iterate through all four possible directions (up, right, down, left).
      for ( let i = 0 ; i < 4 ; i ++ ) {
        // Calculate the new coordinates.
        const ny = p[0] + dy[i] ;
        const nx = p[1] + dx[i] ;

        // Check for boundary conditions and obstacles (wall '#').
        // If out of bounds horizontally or vertically, or if it's a wall, skip.
        if ( nx < 0 || W <= nx ) { // Horizontal out of bounds.
          continue ;
        }
        if ( ny < 0 || H <= ny ) { // Vertical out of bounds.
          continue ;
        }
        if ( table[ny][nx] === '#' ) { // Encountered a wall.
          continue ;
        }
        if ( visited[ny][nx] !== -1 ) { // Already visited this cell.
          continue ;
        }

        // If the cell is valid and unvisited, enqueue it.
        que.push ( [ ny , nx ] ) ;
        // Update its distance from the source.
        visited[ny][nx] = visited[p[0]][p[1]] + 1 ;

        // Update the maximum distance found so far during this BFS.
        answer = Math.max ( answer , visited[ny][nx] ) ;
      }
    }

    /*
     * The following console.log statements are commented out in the original code.
     * They are useful for debugging the 'visited' array and separating outputs.
     */
    // console.log(visited.join("\n"));
    // console.log("---------");

    // Return the maximum distance from this BFS starting point.
    return answer ;
  } ;

  // Initialize the global maximum answer variable.
  let answer = 0 ;

  // Iterate through every cell in the grid.
  for ( let h = 0 ; h < H ; h ++ ) {
    for ( let w = 0 ; w < W ; w ++ ) {
      // If the current cell is a wall, skip it as a starting point.
      if ( table[h][w] === "#" ) {
        continue ;
      }
      // If it's an empty cell, perform BFS from it and update the global max answer.
      answer = Math.max ( answer , bfs ( h , w ) ) ;
    }
  }

  // Output the final maximum answer to the console.
  console.log ( answer ) ;
} ;

// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;