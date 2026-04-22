/*
 * This JavaScript function processes input data to calculate
 * distances based on a grid and specific movement rules.
 * The input is expected to be a multi-line string.
 */
function Main ( input ) {
    // Split the entire input string into an array of lines.
    var line = input.split ( "\n" ) ;


    /*
     * The first line contains grid dimensions and step size.
     * It's expected to be space-separated.
     */
    var tmp = line [ 0 ] .split ( " " ) ;

    var height = Number ( tmp [ 0 ] ) ; // Height of the grid
    var width = Number ( tmp [ 1 ] ) ;  // Width of the grid
    var step = Number ( tmp [ 2 ] ) ;   // Step size for movement calculations

    // Initialize an array to map values to their (x, y) coordinates in the grid.
    var mapping = [ ] ;

    // Loop through the grid definition lines to populate the mapping.
    // Grid lines start from index 1 up to 'height'.
    for ( var i = 1 ; i < height + 1 ; i ++ ) {
        var row = line [ i ] .split ( " " ) ; // Current row data

        // Iterate through elements in the current row.
        for ( var j = 0 ; j < row.length ; j ++ ) {
            var A = Number ( row [ j ] ) ; // Convert string element to number
            // Store coordinates for value A. Note: 'x' is line index, 'y' is column index + 1.
            mapping [ A ] = { "x" : i , "y" : j + 1 } ;
        }
    }


    /*
     * Process the examination queries.
     * The line after the grid defines the number of exams.
     */
    var num_exams = Number ( line [ height + 1 ] ) ;

    // Arrays to store 'from' and 'to' points for each exam.
    var from = [ ] ;
    var to = [ ] ;

    // Populate 'from' and 'to' arrays based on exam query lines.
    // Exam lines start after the grid and num_exams line.
    for ( var j = 1 ; j < num_exams + 1 ; j ++ ) {
        var tmp = line [ height + 1 + j ] .split ( " " ) ;
        from .push ( Number ( tmp [ 0 ] ) ) ; // Starting point for the current exam
        to .push ( Number ( tmp [ 1 ] ) ) ;   // Ending point for the current exam
    }

    // Initialize memoization table and answer array.
    var memo = [ ] ; // Stores previously calculated distances to avoid re-computation
    var ans = [ ] ;  // Stores the final answers for each exam

    /*
     * Calculate distances for each exam query.
     * Utilize memoization for efficiency.
     */
    for ( var k = 0 ; k < from.length ; k ++ ) {
        ans [ k ] = 0 ; // Initialize answer for current exam to zero.

        // Initialize memoization entry if it doesn't exist for the 'from' point.
        if ( ! memo [ from [ k ] ] ) {
            memo [ from [ k ] ] = [ ] ;
        }

        // Check if the result for the current (from, to) pair is already memoized.
        if ( memo [ from [ k ] ] [ to [ k ] ] ) {
            ans [ k ] = memo [ from [ k ] ] [ to [ k ] ] ; // Retrieve memoized result
            continue ; // Move to the next exam
        }

        // Calculate the number of steps required to go from 'from' to 'to'.
        var loop = ( to [ k ] - from [ k ] ) / step ;

        // Iterate through each segment of the path.
        for ( var l = 0 ; l < loop ; l ++ ) {
            // Determine the 'from' and 'to' points for the current segment.
            var frompoint = mapping [ from [ k ] + l * step ] ;
            var topoint = mapping [ from [ k ] + ( l + 1 ) * step ] ;

            // Add Manhattan distance for the current segment to the total.
            ans [ k ] += Math.abs ( topoint.x - frompoint.x ) + Math.abs ( topoint.y - frompoint.y ) ;

            // Memoize the cumulative distance up to the current 'topoint'.
            memo [ from [ k ] ] [ from [ k ] + ( l + 1 ) * step ] = ans [ k ] ;
        }
    }

    // Output the calculated answers, each on a new line.
    console .log ( ans .join ( "\n" ) ) ;
}

/*
 * This part of the code handles standard input/output.
 * It reads the entire input from stdin and passes it to the Main function.
 * DO NOT MODIFY THE CODE BELOW THIS LINE.
 * It's crucial for the automated testing environment.
 */
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;