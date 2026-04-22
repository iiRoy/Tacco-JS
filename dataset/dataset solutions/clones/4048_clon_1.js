/*
 * This script serves as the entry point for a program
 * that reads data from standard input.
 * It passes the read content to the Main function for processing.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// The primary function of this application.
// It takes input arguments as a single string.
function Main ( args )
{
    // Split the input string into an array of lines.
    var input = args . split ( "\n" ) ;

    // Parse the first four lines of input into integer variables.
    // These represent the quantities of different coin denominations (A, B, C)
    // and the target sum (X) to achieve.
    var A = parseInt ( input [ 0 ] , 10 ) ;
    var B = parseInt ( input [ 1 ] , 10 ) ;
    var C = parseInt ( input [ 2 ] , 10 ) ;
    var X = parseInt ( input [ 3 ] , 10 ) ;

    // Initialize a counter variable.
    // This will store the number of combinations that sum up to X.
    var count = 0 ;


    // Outer loop: Iterates through all possible counts of the first coin type (e.g., 500-yen coins).
    for ( var i = 0 ; i <= A ; i ++ )
    {
        // Middle loop: Iterates through all possible counts of the second coin type (e.g., 100-yen coins).
        for ( var j = 0 ; j <= B ; j ++ )
        {
            // Inner loop: Iterates through all possible counts of the third coin type (e.g., 50-yen coins).
            for ( var k = 0 ; k <= C ; k ++ )
            {
                // Calculate the total value for the current combination of coins.
                // If the sum matches the target value X, increment the counter.
                ( ( 500 * i ) + ( 100 * j ) + ( 50 * k ) ) == X ? count ++ : '' ;
            }
        }
    }

    // After checking all possible combinations, print the final count.
    console . log ( count ) ;
}