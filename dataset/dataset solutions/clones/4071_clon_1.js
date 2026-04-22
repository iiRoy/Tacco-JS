function   main ( s )
/*
 * This is the primary function definition.
 * It takes a single argument 's', which is expected to be a string.
 */
{
    // Process the input string 's'.
    // It's assumed 's' contains multiple lines, and we only care about the first.
    // The first line is then split by spaces to get an array of strings.
    s   =   s . split ( "\n" )   [ 0 ]   . split ( " " ) ;

    // Declare a variable 'n'.
    // Concatenate the first and second elements of the 's' array.
    // Convert the resulting string to a number and assign it to 'n'.
    n   =   Number ( s [ 0 ]   +   s [ 1 ] ) ;


    // Perform a calculation and log the result to the console.
    // Calculate the square root of 'n'.
    // Check if the square root is an integer by using the modulo operator (%).
    // If the remainder when divided by 1 is 0, it's an integer.
    // Use a ternary operator to output "Yes" or "No".
    console . log ( Math . sqrt ( n )   %   1   ==   0   ?   "Yes"   :   "No" ) ;
}


// This line calls the 'main' function.
// It reads input from standard input using Node.js's 'fs' module.
// 'readFileSync' reads the entire file synchronously.
// '/dev/stdin' is the standard input path on many Unix-like systems.
// 'utf8' specifies the character encoding for the input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;