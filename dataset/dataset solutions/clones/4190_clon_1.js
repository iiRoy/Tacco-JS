/*
 * This JavaScript file processes a single integer input
 * and determines if the number is divisible by the sum of its digits.
 * This is a classic programming problem for digit manipulation.
 */


// The main function that orchestrates the program flow.
// It takes the raw input string, typically from standard input.
function    Main(  input  )
{
    // Declare a variable 'N' and parse the input string into an integer.
    // The '10' specifies the radix (base 10) for parsing.
    var   N    =   parseInt(  input  ,   10  )  ;


    // Define a nested helper function named 'hoge'.
    // This function calculates the sum of the digits of its input number.
    function   hoge(  hoge  )
    {
        // Convert the input number 'hoge' to a string.
        // Split the string into an array of individual character digits.
        // Map each character back to an integer.
        var   hogehoge   =   hoge.toString().split(  ''  ).map(  n   =>   parseInt(  n  ,   10  )  )  ;

        // Use the 'reduce' method to sum all the integers in the 'hogehoge' array.
        // 'a' is the accumulator (running total), 'b' is the current digit.
        return   hogehoge.reduce(  (  a  ,   b  )   =>   a   +   b  )  ;
    }


    // Perform the conditional check:
    // Is N (the input number) perfectly divisible by the result of hoge(N) (sum of its digits)?
    if  (  N   %   hoge(  N  )   ===   0  )
    {
        // If the remainder of the division is 0, then it is divisible.
        // Output 'Yes' to the console.
        console.log(  'Yes'  )  ;
    }
    else
    {
        // If the remainder is not 0, then it is not divisible.
        // Output 'No' to the console.
        console.log(  'No'  )  ;
    }
}


// This line calls the 'Main' function with the actual input.
// It uses Node.js's 'fs' module to read synchronously from '/dev/stdin' (standard input).
// The input is read as a UTF-8 encoded string.
Main(  require(  'fs'  ).readFileSync(  '/dev/stdin'  ,   'utf8'  )  )  ;