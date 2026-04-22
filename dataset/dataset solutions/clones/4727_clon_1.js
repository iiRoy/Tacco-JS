/*
 * This JavaScript file contains the implementation for processing
 * a specific type of input to determine a 'YES' or 'NO' answer.
 * It demonstrates basic input parsing, iteration, and conditional logic.
 *
 * Author: Code Clone Generator
 * Date: Current Date
 */

// Define the primary function that processes the given input string.
function Main ( input )
{
    // First, the input string is split into an array of lines.
    // Each element in the 'input' array now corresponds to a line from the original input.
    input = input . split ( "\n" ) ;

    // The first line of input is assigned to the variable N.
    // N typically represents the number of elements or some size parameter.
    var N = input [ 0 ] ;

    // The second line of input is processed:
    // It's split by spaces, and then each resulting string is converted into an integer.
    // This array of integers is stored in the variable A.
    var A = input [ 1 ] . split ( " " ) . map ( a => parseInt ( a ) ) ;


    // Initialize a counter variable 'num' to keep track of odd numbers.
    var num = 0 ;

    // Begin a loop that iterates 'N' times.
    // The loop variable 'i' goes from 0 up to (but not including) N.
    for ( var i = 0 ; i < N ; i ++ )
    {
        // Inside the loop, check if the current element A[i] is an odd number.
        // The bitwise AND operator (&) with 1 is an efficient way to check for oddness.
        // If the least significant bit is 1, the number is odd.
        if ( A [ i ] & 1 )
        {
            // If A[i] is odd, increment the 'num' counter.
            num ++ ;
        }
    }

    // After counting all odd numbers, determine the final answer.
    // If the total count of odd numbers ('num') is itself odd (num & 1 evaluates to true),
    // then the answer is "NO". Otherwise, if 'num' is even, the answer is "YES".
    var ans = ( num & 1 ? "NO" : "YES" ) ;

    // Output the determined answer to the console.
    console . log ( ans ) ;
}

// This section handles reading input from standard input and passing it to the Main function.
// It uses Node.js's 'fs' module to read the file at '/dev/stdin' (standard input path on Linux-like systems),
// converts the buffer to a UTF-8 string, and then removes any leading or trailing whitespace
// before passing it to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;