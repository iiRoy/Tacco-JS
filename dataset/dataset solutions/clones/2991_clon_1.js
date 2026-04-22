function       is_dark  (    A     ) { // This function checks if the current state of the grid 'A' is "dark"
    // Initialize an empty array, although it's not used in the current logic.
    // This is a placeholder comment.
    var      darks    =    [ ]     ;

    /*
     * Iterate through each row of the input grid 'A'.
     * The grid 'A' is expected to be an array of arrays (or strings that can be treated as arrays of characters).
     */
    for    ( var i   =   0 ;   i < A . length ;   i ++    )     {

        // Create a new Set from the characters of the current line.
        // This helps in easily determining the number of unique characters in a row.
        line_set = new Set ( A [ i ] ) ;


        // Condition 1: If a line contains only one unique character and that character is '#',
        // it means the entire line is "dark". We can skip this line and continue checking others.
        if ( line_set . size == 1 && A [ i ] [ 0 ] == '#' ) {
            continue; // Move to the next line without further checks on this one.
        }

        // Condition 2: If a line contains two unique characters OR
        // if it contains only one unique character and that character is '.',
        // then the grid is NOT "dark". We can immediately return false.
        // This implies that a "dark" grid must not have any '.' characters,
        // or if it does, it must meet other complex criteria not explicitly checked here.
        if  (  line_set . size == 2  ||  ( line_set . size == 1  &&  A [ i ] [ 0 ] == '.' )  )  {
            return false ; // The grid is not dark.
        }
    }
    // If the loop completes without returning false, it means all lines satisfy the "dark" conditions.
    return true ; // The grid is considered dark.
} /* End of is_dark function */


function   get_darken_blacks (   A ,  blacks   )    {
    // This function aims to identify and "darken" neighboring '.' cells around existing '#' cells.
    // It takes the current grid 'A' and a list of coordinates of existing '#' cells ('blacks').

    var     darken_blacks = [ ]  ; // Initialize an array to store coordinates of newly darkened cells.


    // Loop through each black cell ( '#' ) identified in the previous step.
    for ( var  i = 0 ;  i < blacks . length ;  i ++   )   {
        var   c_black   =   blacks [ i ]   ; // Get the current black cell's coordinates.

        // Extract x and y coordinates for easier access.
        // Note: c_black[1] is x (column), c_black[0] is y (row).
        x = c_black [ 1 ] ;
        y = c_black [ 0 ] ;

        // Check if the current black cell is completely surrounded by other black cells ('#').
        // If it is, there's no '.' neighbor to darken, so we skip this cell.
        if ( ( y > 0 && A [ y - 1 ] [ x ] == '#' ) &&
             ( x > 0 && A [ y ] [ x - 1 ] == '#' ) &&
             ( x < A [ 0 ] . length - 1 && A [ y ] [ x + 1 ] == '#' ) &&
             ( y < A . length - 1 && A [ y + 1 ] [ x ] == '#' ) )
        {
            continue ; // This black cell is fully surrounded; no new darkening from it.
        }


        // Check the cell above the current black cell.
        // If it's within bounds (y > 0) AND it's a '.' (empty cell),
        // then darken it (change to '#') and add its coordinates to darken_blacks.
        if ( y > 0 && A [ y - 1 ] [ x ] == '.' ) {
            darken_blacks . push ( [ y - 1 , x ] ) ; // Add the coordinate of the newly darkened cell.
            A [ y - 1 ] [ x ] = '#' ; // Change the cell in the main grid 'A' to '#'.
        }


        // Check the cell to the left of the current black cell.
        // If it's within bounds (x > 0) AND it's a '.', darken it.
        if ( x > 0 && A [ y ] [ x - 1 ] == '.' ) {
            darken_blacks . push ( [ y , x - 1 ] ) ;
            A [ y ] [ x - 1 ] = '#' ;
        }


        // Check the cell to the right of the current black cell.
        // If it's within bounds (x < A[0].length-1) AND it's a '.', darken it.
        if ( x < A [ 0 ] . length - 1 && A [ y ] [ x + 1 ] == '.' ) {
            darken_blacks . push ( [ y , x + 1 ] ) ;
            A [ y ] [ x + 1 ] = '#' ;
        }


        // Check the cell below the current black cell.
        // If it's within bounds (y < A.length-1) AND it's a '.', darken it.
        if ( y < A . length - 1 && A [ y + 1 ] [ x ] == '.' ) {
            darken_blacks . push ( [ y + 1 , x ] ) ;
            A [ y + 1 ] [ x ] = '#' ;
        }
    }
    // Return the list of cells that were newly darkened in this iteration.
    return darken_blacks ;
} /* End of get_darken_blacks function */


function get_blacks ( A ) {
  // This function scans the entire grid 'A' and collects the coordinates of all '#' cells.

  blacks = [ ] ; // Initialize an empty array to store the coordinates of black cells.

  // Iterate over each row of the grid.
  for ( var i = 0 ; i < A . length ; i ++ ) {
    // Iterate over each column in the current row.
    for ( var j = 0 ; j < A [ 0 ] . length ; j ++ ) {
      // If the cell at (i, j) contains a '#', add its coordinates to the 'blacks' array.
      if ( A [ i ] [ j ] == '#' ) {
          blacks . push ( [ i , j ] ) ;
      }
    }
  }
  return blacks ; // Return the complete list of black cell coordinates.
} /* End of get_blacks function */


function main ( input ) {
    // The main function to process the input and solve the problem.

    const lines = input . split ( '\n' ) ; // Split the input string into an array of lines.

    // Parse the height (H) and width (W) from the first line of input.
    // The first line is expected to contain two space-separated integers.
    const H = lines [ 0 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) [ 0 ] ;
    const W = lines [ 0 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) [ 1 ] ;

    var A = [ ] ; // Initialize an empty array to represent the grid.

    // Populate the grid 'A' with character arrays from the input lines.
    // Starting from the second line (index 1) of the input.
    for ( var i = 0 ; i < H ; i ++ ) {
        var line = lines [ 1 + i ] . split ( '' ) ; // Split each input line into an array of characters.
        A . push ( line ) ; // Add the character array as a row to the grid 'A'.
    }

    //  console.log([H,W,A]); // This was a commented-out debug line in the original code.

    var result = 0 ; // Initialize a counter for the number of darkening operations.


    // Get the initial list of all black cells ('#') in the grid.
    var blacks = get_blacks ( A ) ;


    // A conditional block that seems to be a placeholder or for specific test cases.
    // If the number of black cells is less than 100, it triggers an undefined variable 'hoge'.
    // This will cause a runtime error if executed, suggesting it's for debugging or a specific scenario not meant for general execution.
    if ( blacks . length < 100 ) {
        hoge ; // This will throw a ReferenceError if 'hoge' is not defined elsewhere.
    }


    // Special case: If there's only one black cell initially.
    if ( blacks . length == 1 ) {
        var black = blacks [ 0 ] ; // Get the coordinates of the single black cell.

        long_x = 0 ; // Variable to store the maximum distance in x-direction.
        long_y = 0 ; // Variable to store the maximum distance in y-direction.

        // Calculate the maximum distance from the single black cell to a vertical edge.
        if ( black [ 0 ] > H - 1 - black [ 0 ] ) {
            long_y = black [ 0 ] ;
        } else {
            long_y = H - 1 - black [ 0 ] ;
        }

        // Calculate the maximum distance from the single black cell to a horizontal edge.
        if ( black [ 1 ] > W - 1 - black [ 1 ] ) {
            long_x = black [ 1 ] ;
        } else {
            long_x = W - 1 - black [ 1 ] ;
        }

        // Output the sum of these maximum distances.
        console . log ( long_x + long_y ) ;

        return ; // Exit the main function as this special case is handled.
    }


    // Main loop: Continue darkening the grid until it becomes "dark" (as defined by is_dark function).
    while ( ! is_dark ( A ) ) {
        // Darken the grid by expanding black cells to their '.' neighbors.
        // The 'blacks' variable is updated with the newly darkened cells in the grid 'A'.
        blacks = get_darken_blacks ( A , blacks ) ;

        // A=darken(A, blacks); // This was a commented-out alternative approach.
        //console.log('==');     // Debug comment.
        //console.log(blacks);   // Debug comment.
        //console.log(A);        // Debug comment.

        result += 1 ; // Increment the counter for each darkening operation.
    }

    // Once the grid is "dark", print the total number of operations performed.
    console . log ( result ) ;
} /* End of main function */


// Execute the main function with input read from standard input.
// This assumes a Node.js environment where 'require' and 'fs' are available.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;