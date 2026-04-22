/*
 * This JavaScript code reads input from /dev/stdin,
 * processes it to simulate a pathfinding problem on a grid,
 * and then outputs the minimum score to reach a destination.
 * It uses a breadth-first search (BFS) like approach with
 * two types of moves: 'walk' (cost 0) and 'warp' (cost 1).
 */
const input = require  ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ;

/*
 * The entire logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
 * This helps in creating a private scope for all variables declared inside.
 */
; ( ( input ) => {
  // Split the entire input string into an array of lines.
  const lines = input . split ( '\n' ) ;

  // The first line contains the grid dimensions: Height (H) and Width (W).
  // We parse them as numbers.
  const [ H ,  W ] = lines [ 0 ] . split ( ' ' ) . map ( Number ) ;

  // The second line contains the starting coordinates: C[0] (row) and C[1] (column).
  // These are 1-indexed in the input, so they'll need adjustment later.
  const C = lines [ 1 ] . split ( ' ' ) . map ( Number ) ;

  // The third line contains the destination coordinates: D[0] (row) and D[1] (column).
  // Also 1-indexed.
  const D = lines [ 2 ] . split ( ' ' ) . map ( Number ) ;


  /*
   * Initialize the game map.
   * The actual grid data starts from the 4th line (index 3) of the input.
   * Each line represents a row, and characters within the line are cells.
   */
  const map = [ ] ;
  for  ( let  i = 0 ;  i < H ;  i++ ) {
    // For each row, split the string into an array of characters.
    map [ i ] = lines [ i  +  3 ] . split ( '' ) ;
  }


  // Define the character that represents a wall in the map.
  const wall = '#' ;

  /*
   * Helper function 'f' to check if a move to a given coordinate (h, w)
   * is valid and potentially updates the minimum score (dp value) for that cell.
   *
   * @param {number} h     - The row coordinate.
   * @param {number} w     - The column coordinate.
   * @param {number} score - The current score (cost) to reach this potential cell.
   * @returns {boolean}    - True if the cell's score was updated (meaning it's a new or better path), false otherwise.
   */
  const f = ( h ,  w ,  score ) => {
    let p = null ; // Variable to hold the character at map[h][w]

    // Check if the coordinates are within the bounds of the map.
    if  ( map [ h ]  &&  map [ h ] [ w ] ) {
      p = map [ h ] [ w ] ; // Get the character at the target cell.
    }

    /*
     * If 'p' is not null (i.e., within bounds),
     * and it's not a wall,
     * and the current path's score is better than the previously recorded score
     * for this cell in the 'dp' array.
     */
    if  ( p  &&  p  !==  wall  &&  dp [ h ] [ w ]  >  score ) {
      dp [ h ] [ w ] = score ; // Update the minimum score for this cell.
      return true ; // Indicate that an update occurred.
    }
    else {
      return false ; // No update, either out of bounds, a wall, or not a better path.
    }
  } ;


  /*
   * Initialize the dynamic programming (dp) array.
   * This 2D array will store the minimum "score" (cost) to reach each cell.
   * All cells are initially set to Infinity, meaning they are unreachable.
   */
  const dp = Array ( H ) . fill ( ) . map ( _ => Array ( W ) . fill ( Infinity ) ) ;

  /*
   * Initialize the stack for the BFS-like traversal.
   * It stores coordinates [row, col] of cells to visit.
   * The starting point (C[0], C[1]) needs to be converted from 1-indexed to 0-indexed.
   */
  const stack = [ [ C [ 0 ] - 1 ,  C [ 1 ] - 1 ] ] ;

  // The initial score is 0 at the starting point.
  let score = 0 ;

  // Set the score for the starting cell in the dp array.
  dp [ C [ 0 ] - 1 ] [ C [ 1 ] - 1 ] = score ;

  // Loop variable for popping items from the stack.
  let i = null ;

  /*
   * Main traversal loop. Continues as long as there are cells in the stack to process.
   * This implements a variant of BFS where 'walk' moves are processed first (cost 0),
   * then 'warp' moves (cost 1).
   */
  while  ( i = stack . pop ( ) ) {
    /*
     * Define the possible "walk" moves from the current cell 'i'.
     * These are adjacent cells (up, down, left, right) and cost 0.
     */
    const walk = [
      [ i [ 0 ]  +  1 ,  i [ 1 ]     ] ,
      [ i [ 0 ]  -  1 ,  i [ 1 ]     ] ,
      [ i [ 0 ]     ,  i [ 1 ]  +  1 ] ,
      [ i [ 0 ]     ,  i [ 1 ]  -  1 ]
    ] ;

    let n = null ; // Loop variable for iterating through walk/warp moves.

    // The score to reach the current cell 'i' is retrieved from the dp array.
    score = dp [ i [ 0 ] ] [ i [ 1 ] ] ;

    // Process all 'walk' moves from the current cell.
    while  ( n = walk . pop ( ) ) {
      /*
       * If moving to 'n' is valid and results in a better path (score update),
       * then add 'n' to the stack to be processed later.
       * Note: 'walk' moves have the same score as the current cell.
       */
      if  ( f ( n [ 0 ] ,  n [ 1 ] ,  score ) ) {
        stack . push ( [ n [ 0 ] ,  n [ 1 ] ] ) ;
      }
    }


    /*
     * Define the possible "warp" moves from the current cell 'i'.
     * These are cells within a 5x5 square centered at 'i', excluding
     * the immediate adjacent cells (already covered by 'walk') and the current cell itself.
     * Each warp move costs 1 more than the current cell's score.
     */
    const warp = [
      [ i [ 0 ]  +  2 ,  i [ 1 ]  +  2 ] ,
      [ i [ 0 ]  +  2 ,  i [ 1 ]  +  1 ] ,
      [ i [ 0 ]  +  2 ,  i [ 1 ]      ] ,
      [ i [ 0 ]  +  2 ,  i [ 1 ]  -  1 ] ,
      [ i [ 0 ]  +  2 ,  i [ 1 ]  -  2 ] ,
      [ i [ 0 ]  +  1 ,  i [ 1 ]  +  2 ] ,
      [ i [ 0 ]  +  1 ,  i [ 1 ]  +  1 ] ,
      [ i [ 0 ]  +  1 ,  i [ 1 ]  -  1 ] ,
      [ i [ 0 ]  +  1 ,  i [ 1 ]  -  2 ] ,
      [ i [ 0 ]      ,  i [ 1 ]  +  2 ] ,
      [ i [ 0 ]      ,  i [ 1 ]  -  2 ] ,
      [ i [ 0 ]  -  1 ,  i [ 1 ]  +  2 ] ,
      [ i [ 0 ]  -  1 ,  i [ 1 ]  +  1 ] ,
      [ i [ 0 ]  -  1 ,  i [ 1 ]  -  1 ] ,
      [ i [ 0 ]  -  1 ,  i [ 1 ]  -  2 ] ,
      [ i [ 0 ]  -  2 ,  i [ 1 ]  +  2 ] ,
      [ i [ 0 ]  -  2 ,  i [ 1 ]  +  1 ] ,
      [ i [ 0 ]  -  2 ,  i [ 1 ]      ] ,
      [ i [ 0 ]  -  2 ,  i [ 1 ]  -  1 ] ,
      [ i [ 0 ]  -  2 ,  i [ 1 ]  -  2 ]
    ] ;

    // Increment the score for warp moves.
    // All warp moves from the current cell 'i' will cost score + 1.
    score++ ;

    // Process all 'warp' moves from the current cell.
    while  ( n = warp . pop ( ) ) {
      /*
       * If moving to 'n' via warp is valid and results in a better path,
       * then add 'n' to the stack.
       */
      if  ( f ( n [ 0 ] ,  n [ 1 ] ,  score ) ) {
        stack . push ( [ n [ 0 ] ,  n [ 1 ] ] ) ;
      }
    }
  }

  /*
   * After the traversal, the minimum score to reach the destination
   * (D[0]-1, D[1]-1) is stored in the dp array.
   */
  const ans = dp [ D [ 0 ] - 1 ] [ D [ 1 ] - 1 ] ;

  /*
   * Output the answer. If the destination was unreachable (score is Infinity),
   * output -1; otherwise, output the calculated minimum score.
   */
  console . log ( ans  ===  Infinity  ?  -1  :  ans ) ;

} ) ( input ) ; // The IIFE is immediately invoked with the 'input' variable.