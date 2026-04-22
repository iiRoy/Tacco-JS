/*
 * This JavaScript program processes numerical input from standard input.
 * It reads pairs of numbers and performs a specific calculation on them.
 * The loop continues as long as the product of the current pair is not zero.
 */


    var arr = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( /\s/ ) ;
    // The 'arr' variable now holds an array of strings, split by whitespace.
    // We expect these to be convertible to numbers for calculations.


    var    xx    ; // This variable will temporarily store intermediate calculations.


    // Begin the main processing loop.
    // It iterates through the 'arr' array, taking two elements at a time (i and i+1).
    // The loop condition checks if the product of these two elements is non-zero.
    for ( var i = 0 ; arr [ i ] * arr [ i + 1 ] != 0 ; i += 2 )
    {

        // Calculate the square of the first number in the current pair.
        // This value 'xx' will be used in the subsequent calculation.
        xx = arr [ i ] * arr [ i ] ;

        // Perform the core calculation and print the result to the console.
        // The formula involves the square root of a sum of squares,
        // multiplied by the first number, and then adding 'xx' again.
        console . log ( arr [ i ] * Math . sqrt ( 4 * arr [ i + 1 ] * arr [ i + 1 ] + xx ) + xx ) ;

    } // End of the processing loop.


// Program execution finishes here.