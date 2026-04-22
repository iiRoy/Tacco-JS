/*
 * This program, identified as ABC087, is designed to calculate
 * the number of distinct combinations of Japanese coins
 * (500-yen, 100-yen, and 50-yen) that sum up to a specific target amount.
 */

// The primary function that processes the input data.
function Main ( input ) {
    // First, the entire input string is split into an array of lines.
    input = input.split( "\n" ) ;

    // Extracting and parsing the maximum allowed number of 500-yen coins.
    const A = parseInt( input[0] , 10 ) ;

    // Extracting and parsing the maximum allowed number of 100-yen coins.
    const B = parseInt( input[1] , 10 ) ;

    // Extracting and parsing the maximum allowed number of 50-yen coins.
    const C = parseInt( input[2] , 10 ) ;

    // Extracting and parsing the target total sum that needs to be achieved.
    const X = parseInt( input[3] , 10 ) ;


    // Initialize a counter variable to keep track of valid combinations.
    var count = 0 ;

    // Begin a triple-nested loop to iterate through all possible coin counts.

    // Outer loop for the number of 500-yen coins (variable 'a').
    // It iterates from 0 up to the maximum allowed 'A'.
    for ( var a = 0 ; a <= A ; a++ ) {

        // Middle loop for the number of 100-yen coins (variable 'b').
        // It iterates from 0 up to the maximum allowed 'B'.
        for ( var b = 0 ; b <= B ; b++ ) {

            // Inner loop for the number of 50-yen coins (variable 'c').
            // It iterates from 0 up to the maximum allowed 'C'.
            for ( var c = 0 ; c <= C ; c++ ) {

                // Calculate the current total sum based on the chosen coin counts.
                var sum = ( a * 500 ) + ( b * 100 ) + ( c * 50 ) ;

                // Check if the calculated sum equals the target sum X.
                if ( sum == X ) {
                    // If the sums match, increment the counter for valid combinations.
                    count++ ;
                }
            }
        }
    }

    // Finally, print the total count of combinations to the standard output.
    console.log( count ) ;
}

// This line handles the execution of the Main function,
// reading input from standard input, typically for online judge systems.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;