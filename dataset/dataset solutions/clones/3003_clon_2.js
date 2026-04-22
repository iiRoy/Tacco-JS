/*
 * This script processes an array of input strings to calculate a specific result.
 * It's designed to read data from standard input, parse it, and then perform
 * a series of arithmetic operations to derive a final numerical output.
 */
ProcessInputData =  (   incomingData    )   =>  {

    // Assume the first element of the incoming array contains
    // all necessary parameters, space-separated.
    var     parsedValues    =   incomingData[0] .   split   (   ' ' )   ;

    //  Declare and initialize distinct variables for each numerical component.
    //  These will hold values representing a divisor, a multiplier, and a total amount.
    var     divisorValue    =   parsedValues[0]         ,
            multiplierValue =   parsedValues[1]         ,
            totalLimit      =   parsedValues[2]         ;


    //  Calculate the integer part of the division of the total limit by the divisor.
    //  This represents how many full "units" can be extracted.
    var     quotientWhole   =   Math.floor  (   totalLimit  /   divisorValue    )   ;

    //  Finally, multiply the calculated whole quotient by the multiplier value.
    //  The result is then printed to the console.
    console .   log (   quotientWhole   *   multiplierValue )   ;

}   ;


// Main execution block:
// Read the entire content of standard input, decode it as UTF-8,
// split it into an array of lines, and pass it to the processing function.
ProcessInputData(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
            .split('\n')
);