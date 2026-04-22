function NotOne( arr ) { /* This function identifies numbers that appear more than once in an array. */


   // Initialize a frequency counter for digits 0-9.
   var cnt = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;


    arr . forEach ( function ( v ) {
        // Increment the count for the current value.
        // The (v-0) ensures 'v' is treated as a number.
        cnt [ ( v - 0 ) ] ++ ;
    } ) ;


    var bad = [ ] ; // This array will store indices of numbers that appear 2 or more times.


    cnt . forEach ( function ( v , i ) {
        /*
         * Iterate through the frequency counts.
         * If a number's count is 2 or more, it's a 'bad' number.
         */
        if ( v >= 2 ) {
            bad . push ( i ) ;
        }
    } ) ;


    var result = [ ] ; // This array will store the original indices of 'bad' numbers in the input 'arr'.


    arr . forEach ( function ( v , i ) {
        // Check if the current number 'v' is among the 'bad' numbers.
        if ( bad . indexOf ( v ) != -1 ) {
            result . push ( i ) ; // If it is, add its original index to the result.
        }
    } ) ;


    return result ; // Return the list of indices where 'bad' numbers were found.

} // End of NotOne function


// Read input from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var Arr = input . trim ( ) . split ( "\n" ) ; // Split input by newlines into an array.
var n = Arr . shift ( ) - 0 ; // Get the first line, convert to number, which is the number of test cases.


for ( var I = 0 ; I < n ; I ++ ) { // Loop through each test case.


    if ( I != 0 ) {
        console . log ( "\n" ) ; // Print a newline between test case outputs, except for the first one.
    }


    var yx = [ ] ; // Stores the current Sudoku grid values.
    var YX = [ ] ; // Stores modification flags for each cell (initially all zeros).


    for ( var i = 0 ; i < 9 ; i ++ ) { // Loop to read 9 rows of the Sudoku grid.

        // Read a row, split by spaces, and convert each part to a number.
        var v = Arr . shift ( ) . split ( " " ) . map ( Number ) ;
        yx . push ( v ) ; // Add the parsed row to the yx grid.
        // Initialize a corresponding row in YX with zeros.
        YX . push ( [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ) ;
    } // End of row reading loop.


    // Check rows for duplicate numbers.
    for ( var i = 0 ; i < 9 ; i ++ ) {

        var re = NotOne ( yx [ i ] ) ; // Find indices of duplicates in the current row.

        re . forEach ( function ( v ) {
            YX [ i ] [ v ] ++ ; // Mark cells in YX corresponding to row duplicates.
        } ) ;
    } // End of row checking loop.


    // Check columns for duplicate numbers.
    for ( var i = 0 ; i < 9 ; i ++ ) {

        var yy = [ ] ; // Temporary array to hold column values.
        for ( var j = 0 ; j < 9 ; j ++ ) {
            yy . push ( yx [ j ] [ i ] ) ; // Extract column 'i' values.
        }

        var re = NotOne ( yy ) ; // Find indices of duplicates in the current column.

        re . forEach ( function ( v ) {
            YX [ v ] [ i ] ++ ; // Mark cells in YX corresponding to column duplicates.
        } ) ;
    } // End of column checking loop.


    // Check 3x3 blocks for duplicate numbers.
    for ( var y = 0 ; y < 3 ; y ++ ) {

        for ( var x = 0 ; x < 3 ; x ++ ) {

            var i = y * 3 ; // Starting row index for the current block.
            var j = x * 3 ; // Starting column index for the current block.

            var z = [ // Define the coordinates of cells within the current 3x3 block.
            [ 0 + i , 0 + j ] , [ 0 + i , 1 + j ] , [ 0 + i , 2 + j ] ,
            [ 1 + i , 0 + j ] , [ 1 + i , 1 + j ] , [ 1 + i , 2 + j ] ,
            [ 2 + i , 0 + j ] , [ 2 + i , 1 + j ] , [ 2 + i , 2 + j ]
            ] ;

            var zz = [ ] ; // Temporary array to hold values of the current 3x3 block.
            z . forEach ( function ( v ) {
                zz . push ( yx [ v [ 0 ] ] [ v [ 1 ] ] ) ; // Extract values from the grid using block coordinates.
            } ) ;

            var re = NotOne ( zz ) ; // Find indices of duplicates within the current block.

            re . forEach ( function ( v ) {
                // Mark cells in YX corresponding to block duplicates.
                // 'v' is the index within the 'zz' array, so use 'z[v]' to get original coordinates.
                YX [ z [ v ] [ 0 ] ] [ z [ v ] [ 1 ] ] ++ ;
            } ) ;
        } // End of inner 3x3 block column loop.
    } // End of outer 3x3 block row loop.


    // Format the output grid.
    yx . forEach ( function ( V , i ) {

        V . forEach ( function ( v , j ) {
            // If a cell has been marked as a duplicate (YX[i][j] >= 1), prepend an asterisk.
            // Otherwise, prepend a space.
            yx [ i ] [ j ] = ( YX [ i ] [ j ] >= 1 ) ? "*" + v : " " + v ;
        } ) ;
    } ) ;


    // Print the formatted grid, joining rows with newlines and removing commas.
    console . log ( yx . join ( "\n" ) . replace ( /\ , / g , "" ) ) ;

} // End of test case loop.