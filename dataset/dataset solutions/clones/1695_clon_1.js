'use strict' ; // Enforce strict mode for cleaner code.

function Main ( stdin ) {

    // Process the input string: trim whitespace and split into lines.
    const input = stdin . trim ( ) . split ( / \r? \n / g ) ;

    // Destructure the first line to get height (h), width (w), and target count (k).
    // Convert them to numbers.
    const [ h , w , k ] = input . shift ( ) . split ( ' ' ) . map ( Number ) ;

    // The rest of the input lines represent the grid 'c'.
    const c = input ;

    // Initialize the counter for valid combinations.
    let result = 0 ;

    // Iterate through all possible combinations of rows to exclude.
    // '1 << h' generates a number with 'h' bits set, representing 2^h combinations.
    for ( let is = 0 ; is < ( 1 << h ) ; is ++ ) {

        // Iterate through all possible combinations of columns to exclude.
        // '1 << w' generates a number with 'w' bits set, representing 2^w combinations.
        for ( let js = 0 ; js < ( 1 << w ) ; js ++ ) {

            // Initialize sum for the current combination of excluded rows/columns.
            let sum = 0 ;

            // Iterate over each row of the grid.
            for ( let i = 0 ; i < h ; i ++ ) {

                // If the i-th bit of 'is' is set, it means this row is excluded.
                if ( ( is >> i ) & 1 ) {
                    continue ; // Skip this row.
                }

                // Iterate over each column of the grid.
                for ( let j = 0 ; j < w ; j ++ ) {

                    // If the j-th bit of 'js' is set, it means this column is excluded.
                    if ( ( js >> j ) & 1 ) {
                        continue ; // Skip this column.
                    }

                    // If the cell contains a '#', increment the sum.
                    if ( c [ i ] [ j ] === "#" ) {
                        sum ++ ;
                    }
                }
            }

            // If the count of '#' in the remaining cells equals 'k', increment the total result.
            if ( sum === k ) {
                result ++ ;
            }
        }
    }

    // Output the final count of valid combinations.
    console . log ( result ) ;
}

// This part of the code is for execution in a specific environment (e.g., competitive programming).
// It reads the entire content of standard input as a UTF-8 string and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;