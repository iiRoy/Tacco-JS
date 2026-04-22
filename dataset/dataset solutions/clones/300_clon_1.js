( function  (  input  )   {

  /*
   * This function, named 'isRect', is designed to determine
   * if a specified square region within the global 'data' grid
   * consists entirely of '.' characters, signifying an empty space.
   *
   * @param { number } x    - The zero-based column index where the square begins.
   * @param { number } y    - The zero-based row index where the square begins.
   * @param { number } size - The extent of the square. A 'size' of 0 means a 1x1 square,
   *                          a 'size' of 1 means a 2x2 square, and so forth.
   * @returns { boolean }   - Returns 'true' if the entire region is empty (all '.'),
   *                          otherwise returns 'false' as soon as a non-'.' character is found.
   */
  function isRect ( x , y , size )
  {
    // Begin iterating through the rows that are part of the potential square.
    // The loop runs from the starting 'y' coordinate up to 'y + size'.
    for ( var i  =  y ;  i  <=  y + size ;  i ++  )
    {
      // For each row, iterate through the columns that are part of the potential square.
      // The loop runs from the starting 'x' coordinate up to 'x + size'.
      for ( var j  =  x ;  j  <=  x + size ;  j ++  )
      {
        // Check the character at the current grid position (i, j).
        // If it's anything other than a '.', it means this spot is occupied.
        if  ( data [ i ] [ j ]  !==  '.'  )
        {
          /*
           * An occupied cell has been found within the potential rectangle.
           * Therefore, this region is NOT an empty rectangle.
           * We can immediately stop checking and return false.
           */
          return false ;
        }
      } /* End of inner loop (columns) */
    } /* End of outer loop (rows) */

    // If the function reaches this point, it means all cells within the
    // specified square region were successfully checked and found to be '.'.
    // Thus, it is a valid empty rectangle.
    return true ;
  } // End of isRect function definition


  // Declare and initialize variables required for processing the input.
  // 'inputs' will hold an array of strings, each representing a line from the input.
  var inputs  =  input.replace ( /\r/g ,  ''  ) . split ( "\n" ) ;

  // 'data' will store the grid itself, once parsed.
  var data ;

  // 'n' will store the dimension of the square grid (N x N).
  var n ;

  // 'i' and 'j' are general-purpose loop counters, commonly used for row and column indices.
  var i ;
  var j ;


  /*
   * The main program loop. It continues to process test cases
   * until a specific termination condition is met.
   */
  while  ( true )
  {
    // Read the first line of the current test case, which should be the grid size 'n'.
    // 'parseInt' converts the string to an integer. 'shift()' removes and returns the first element.
    n = parseInt ( inputs.shift ( ) ) ;

    // Check for the termination condition: if 'n' is 0, exit the loop.
    if  ( n  ===  0 )
    {
      break ; /* Exit the infinite 'while' loop */
    }

    // Initialize the 'data' array to an empty state for the new grid.
    data = [ ] ;

    // Populate the 'data' grid with 'n' rows from the input.
    // Each row is a string representing a line of the grid.
    for  ( i  =  0 ;  i  <  n ;  i ++  )
    {
      data.push ( inputs.shift ( ) ) ;
    }

    /*
     * The following lines are commented out. They were likely used during
     * development for debugging purposes to inspect the parsed data
     * or test the 'isRect' function with specific coordinates.
     *
     * console.log(data);
     * console.log(isRect(3, 3, 5));
     */


    // Initialize 'size' to 1. This variable will eventually hold the
    // side length of the largest empty square found (e.g., size=1 for 1x1, size=2 for 2x2).
    var size  =  1 ;

    /*
     * Begin the process of finding the largest empty square in the grid.
     * The outer loop iterates through each possible starting row 'i'.
     */
    for  ( i  =  0 ;  i  <  n ;  i ++  )
    {
      /*
       * The inner loop iterates through each possible starting column 'j'.
       * Note that 'j' is NOT incremented in the loop header; its increment
       * is handled conditionally within the loop body.
       */
      for  ( j  =  0 ;  j  <  n ;  )
      {
        // Check if a square of the current 'size' can be formed
        // starting at the current (j, i) coordinates.
        if  ( isRect ( j , i , size )  )
        {
          /*
           * This was a console log for debugging, confirming a rectangle was found.
           * console.log("rect!", j, i, size);
           */
          size ++ ; // If a rectangle is found, try for a larger one by incrementing 'size'.
        }
        else
        {
          /*
           * This was another debugging console log, indicating no rectangle at this position.
           * console.log("not rect!", j, i, size);
           */
          // If no rectangle of the current 'size' is found,
          // move the starting column 'j' forward by 'size' steps.
          // This optimizes the search by skipping cells that cannot be part of
          // a rectangle of the current 'size' or larger, starting from 'j'.
          j  +=  size ;
        }
      } /* End of inner loop for columns */
    } /* End of outer loop for rows */

    // After iterating through the entire grid, 'size' will hold the
    // maximum side length of an empty square that could be found.
    // Output this value to the console.
    console.log ( size ) ;
  } /* End of the main 'while' loop for processing all test cases */

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ; // IIFE immediately invoked with file system input.