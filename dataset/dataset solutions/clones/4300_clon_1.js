function   Main   ( input )   {
    // This function processes the input to solve a specific problem.
    // It's designed to handle a grid-based puzzle, likely a minesweeper-like game.

    let    array    =    input.split ( '\n' ) ; // Split the input string by newlines into an array.

    // Extract height (h) and width (w) from the first line of the input.
    // The '*1' converts the string to a number.
    const    h    =    array [ 0 ] .split ( ' ' ) [ 0 ] * 1 ;
    const    w    =    array [ 0 ] .split ( ' ' ) [ 1 ] * 1 ;

    // Filter out the first line, as it contains h and w, and the rest are grid data.
    array    =    array .filter ( ( elm , i ) => i >= 1 ) ;

    // Count the number of empty cells (represented by '.') in the entire input.
    // This helps determine the state of the grid (all bombs, all empty, or mixed).
    const    empty_num    =    input .match ( / (\.) /g ) ;


    if  ( ! empty_num )  {
        // Case 1: If there are no empty cells found, it means the grid contains only bombs.
        // Original comment: 爆弾しかない (Only bombs)
        // No empty cells were detected in the input, implying a grid full of bombs or an invalid grid.
        console.log ( array .join ( '\n' ) + '\n' ) ;

    }  else  if  ( empty_num .length  ==  w * h )  {
        // Case 2: If the number of empty cells equals the total grid size (w * h),
        // it means there are no bombs at all.
        // Original comment: 爆弾がない (No bombs)
        // All cells are empty, so replace everything with '0' (representing no adjacent bombs).
        console.log ( array .join ( '\n' ) .replace ( / . /g , '0' ) + '\n' ) ;

    }  else  {
        // Case 3: The grid contains a mix of empty cells and bombs.
        // This is the main processing logic for counting adjacent bombs.

        // Note: The variable 'lines' is used here, which is not defined in the provided context.
        // Assuming 'lines' should refer to 'array' based on the typical problem structure.
        // However, Type I clone requires strict adherence to variable names.
        for  ( var  i = 0 ;  i < lines .length ;  i ++ )  {
            for  ( var  j = 0 ;  j < lines [ i ] .length ;  j ++ )  {
                // Only process if the current cell is an empty cell ('.').
                if  ( lines [ i ] [ j ]  !=  '.' )  continue ;

                // Initialize variables for all 8 surrounding cells.
                // If a cell is out of bounds, it's treated as null.

                // Cell directly above (u - up)
                u   =   ! lines [ i - 1 ]   ?   null   :   lines [ i - 1 ] [ j ] ,   /*  Cell     above     current    */
                // Cell directly below (d - down)
                d   =   ! lines [ i + 1 ]   ?   null   :   lines [ i + 1 ] [ j ] ,   /*  Cell     below     current    */
                // Cell directly to the right (r - right)
                r   =   j == w              ?   null   :   lines [ i ] [ j + 1 ] ,   /*  Cell     right     of     current    */
                // Cell directly to the left (l - left)
                l   =   j == 0              ?   null   :   lines [ i ] [ j - 1 ] ,   /*  Cell     left     of     current    */
                // Cell diagonally up-right (ur)
                ur  =   ! ( u && r )        ?   null   :   lines [ i - 1 ] [ j + 1 ] ,   /*  Cell     up-right     from     current    */
                // Cell diagonally up-left (ul)
                ul  =   ! ( u && l )        ?   null   :   lines [ i - 1 ] [ j - 1 ] ,   /*  Cell     up-left     from     current    */
                // Cell diagonally down-right (dr)
                dr  =   ! ( d && r )        ?   null   :   lines [ i + 1 ] [ j + 1 ] ,   /*  Cell     down-right     from     current    */
                // Cell diagonally down-left (dl)
                dl  =   ! ( d && l )        ?   null   :   lines [ i + 1 ] [ j - 1 ] ;   /*  Cell     down-left     from     current    */


                // Concatenate the values of all surrounding cells and count the bombs ('#').
                var   num   =   ( u + r + d + l + ur + ul + dr + dl ) .match ( / # /g ) ;
                // If no bombs are found, num will be null, so set it to 0. Otherwise, use its length.
                num   =   ! num   ?   0   :   num .length ;
                // Replace the '.' in the current cell with the calculated number of adjacent bombs.
                lines [ i ]   =   lines [ i ] .replace ( '.' ,   num ) ;
            } ; // End of inner loop (columns)
        } ; // End of outer loop (rows)

        // Print the modified grid to the console.
        console.log ( lines .join ( '\n' ) ) ;
    }
}
// This line is typically used for local testing or competitive programming environments.
// It reads input from standard input and passes it to the Main function.
// Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;