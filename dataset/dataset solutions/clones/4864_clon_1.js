/*
 * This is the main program entry point.
 * It processes input to find a specific string.
 */
function Main ( input ) {
    // Split the input string by newline characters into an array of lines.
    input = input.split( "\n" ) ;

    /*
     * The first line contains memory information.
     * We're interested in the second part (index 1) for later use.
     */
    var mem = input[ 0 ] . split ( " " ) ;

    // Remove the first element (which contained 'mem' info) from the input array.
    input . shift ( ) ;

    // Convert the remaining 1D array of strings into a 2D array of strings.
    input = arr1dto2d ( input ) ;


    // Iterate through each row of the 2D input array.
    for ( var i = 0 ; i < input . length ; i ++ ) {

        // For each row, iterate through its columns, up to the value specified in mem[1].
        for ( var j = 0 ; j < mem[ 1 ] ; j ++ ) {

            // Check if the current element at [i][j] is exactly "snuke".
            if ( input [ i ] [ j ] == "snuke" ) {
                // If "snuke" is found, log its coordinates.
                // Column is converted to a letter (A=0, B=1, etc.), row is 1-indexed.
                console . log ( String . fromCharCode ( 65 + j ) + ( i + 1 ) ) ;

                // Exit the inner loop as "snuke" has been found.
                break ;
            }
        }
    }
}


// Immediately invoke the Main function with input from stdin.
// This reads the file, converts it to UTF-8, removes leading/trailing whitespace, and passes it.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;


/*
 * Helper function to transform a 1D array of strings into a 2D array.
 * Each string in the input array is split by spaces.
 */
function arr1dto2d ( arr ) {
    // Loop through each element (which is a string) in the provided array.
    for ( var i = 0 ; i < arr . length ; i ++ ) {
        // Split the current string by spaces and reassign it back to the same array index.
        arr [ i ] = arr [ i ] . split ( " " ) ;
    }
    // Return the modified array, now a 2D array.
    return arr ;
}