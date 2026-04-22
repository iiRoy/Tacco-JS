/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to make the code appear visually different.
 */

// This function processes the input data.
function Main ( input ) {
    // The input string is split into an array of lines.
    input = input.split ( "\n" ) ;

    // Extracting parts of the input data for further processing.
    tmp1 = input [ 1 ] . split ( " " ) ;
    tmp2 = input [ 3 ] . split ( " " ) ;
    
    // Convert the first line to an integer, base 10. This is 'N'.
    var N = parseInt ( input [ 0 ] , 10 ) ;
    // Initialize an empty array 'D'.
    var D = new Array ( ) ;
    
    // Loop through 'N' elements to populate array 'D'.
    for ( var i = 0 ; i < N ; i ++ ) {
        // Convert string element to integer.
        var tmp = parseInt ( tmp1 [ i ] , 10 ) ;
        // Add the integer to array 'D'.
        D . push ( tmp ) ;
    }

    /*
     * The following block is a commented-out section from the original code.
     * It's preserved as a block comment in this clone.
     * for(var i = 0; i<N;i++){
     *     console.log(D.join());
     * }
     */

    // Convert the third line to an integer, base 10. This is 'M'.
    var M = parseInt ( input [ 2 ] , 10 ) ;
    // Initialize an empty array 'T'.
    var T = new Array ( ) ;
    
    // Loop through 'M' elements to populate array 'T'.
    for ( var i = 0 ; i < M ; i ++ ) {
        // Convert string element to integer.
        tmp = parseInt ( tmp2 [ i ] , 10 ) ;
        // Add the integer to array 'T'.
        T . push ( tmp ) ;
    }
    
    // Create a new generic object to serve as a hash map (or frequency counter).
    var hash = new Object ( ) ;
    
    // Initialize counts for elements in 'D' to zero.
    for ( var i = 0 ; i < N ; i ++ ) {
        hash [ D [ i ] ] = 0 ;
    }
    
    // Increment counts for each occurrence of elements in 'D'.
    for ( var i = 0 ; i < N ; i ++ ) {
        hash [ D [ i ] ] ++ ;
    }

    /*
     * Another commented-out section, demonstrating hash map iteration.
     * for (var key in hash) {
     *     document.write (key + "の値：" + hash[key] + "<br>");
     * }
     */

    // Initialize a flag to determine if all 'T' elements can be found in 'D'.
    var flag = true ;
    
    // Iterate through elements of array 'T'.
    for ( var i = 0 ; i < M ; i ++ ) {
        // If an element from 'T' is not found in the hash map (undefined or null),
        // or if its count is zero, set flag to false and break.
        if ( ! hash [ T [ i ] ] ) {
            flag = false ;
            break ;
        }
        
        // Explicitly check if the count is zero (redundant due to previous check, but kept as per clone rules).
        if ( hash [ T [ i ] ] == 0 ) {
            flag = false ;
            break ;
        }
        // If element is found and count is greater than zero, decrement its count.
        else {
            hash [ T [ i ] ] -- ;
        }
    }

    // Output the result based on the 'flag' value.
    if ( flag ) {
        console . log ( "YES" ) ;
    }
    else {
        console . log ( "NO" ) ;
    }
}

// This is a debug function, typically for browser environments or testing.
function debug ( ) {
	// Retrieves input from an HTML element with id "input".
	var input = document . getElementById ( "input" ) . value ;
	// Calls the main processing function with the retrieved input.
	Main ( input ) ;
}

// This line should not be edited. It handles standard input/output for competitive programming environments.
// It reads the entire file from /dev/stdin and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;