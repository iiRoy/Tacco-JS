// This function calculates the least common multiple (LCM) of two numbers
// by first finding their greatest common divisor (GCD) using the Euclidean algorithm.
function bai ( x , y )
{
    // Initialize working variables for the GCD calculation.
    // x1 and y1 will be modified during the process, preserving original x, y.
    var x1 = x , y1 = y ;

    // A temporary variable to hold values during swapping in the Euclidean algorithm.
    var temp ;

    // The Euclidean algorithm loop: continue until y1 becomes zero.
    // When y1 is zero, x1 holds the GCD.
    while ( y1 != 0 )
    {
        // Store the current value of y1 before it's updated.
        temp = y1 ;

        // Calculate the remainder of x1 divided by y1.
        // This is the core step of the Euclidean algorithm.
        y1 = x1 % y1 ;

        // Update x1 with the old value of y1 (which is stored in temp).
        x1 = temp ;
    }
    // At this point, x1 contains the Greatest Common Divisor (GCD) of the original x and y.
    // The Least Common Multiple (LCM) of two numbers (a, b) is calculated as (a * b) / GCD(a, b).
    return x * y / x1 ;
}


// The main entry point for processing the input data.
// The entire input content is passed as a single string argument.
function Main ( input )
{
    // A debug message printed to the console to indicate the start of the main processing logic.
    console . log ( "main" ) ;

    // The input string is split into an array of strings, using the newline character as a delimiter.
    // Each line of the input data becomes an element in the 'input' array (e.g., input[0], input[1], etc.).
    input = input . split ( "\n" ) ;

    // The first line (input[0]) is expected to be a number representing a count.
    // Subtracting 0 is a common JavaScript trick to convert a string to a number.
    var count = input [ 0 ] - 0 ;

    // The second line (input[1]) contains space-separated values.
    // This line is split into an array of strings, where each element is one of the values.
    var values = input [ 1 ] . split ( " " ) ;

    // Initialize the 'numerator' variable for the cumulative calculation.
    // It starts with a value of 1.
    var numerator = 1 ;

    // Initialize the 'denominator' variable with the first value from the 'values' array.
    // This string value is also converted to a number.
    var denominator = values [ 0 ] - 0 ;

    // Another debug message, indicating the program is about to enter the main processing loop.
    console . log ( "for" ) ;

    // Loop through the 'values' array, starting from the second element (index 1) up to 'count - 1'.
    // This loop processes each subsequent value from the input.
    for ( var i = 1 ; i < count ; i ++ )
    {
        // Debug output: print the current loop iteration index to the console.
        console . log ( i ) ;

        // Calculate a 'newDenominator' by calling the 'bai' function (which computes LCM).
        // It takes the current 'denominator' and the current value from the 'values' array (converted to number).
        var newDenominator = bai ( denominator , values [ i ] - 0 ) ;

        // Update the 'numerator' using a multiplicative assignment.
        // This step involves the 'newDenominator' and the old 'denominator'.
        numerator *= newDenominator / denominator ;

        // Further update the 'numerator' using an additive assignment.
        // This step incorporates the 'newDenominator' and the current value from the 'values' array.
        numerator += newDenominator / values [ i ] - 0 ;
    } // End of the processing loop.


    // Finally, print the result of the overall calculation to the console.
    // The result is the initial 'denominator' divided by the final 'numerator'.
    console . log ( denominator / numerator ) ;
}


// ********************************************************************************
// * DO NOT EDIT THE FOLLOWING LINE. This section handles standard input/output. *
// * It reads the entire input from stdin and then calls the Main function.       *
// ********************************************************************************
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;