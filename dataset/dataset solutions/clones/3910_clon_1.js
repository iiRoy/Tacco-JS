// This JavaScript file contains a program to check for the presence of specific characters.

/*
 * The main function takes a string as input and determines if it contains
 * the characters 'a', 'b', and 'c' anywhere within it.
 * It leverages the String.prototype.indexOf() method for character detection.
 */
function main( input )
{

    // Find the index of the character 'a' in the input string.
    // A value of -1 indicates that 'a' was not found.
    var aa = input . indexOf ( "a" ) ;

    // Find the index of the character 'b' in the input string.
    // A value of -1 indicates that 'b' was not found.
    var bb = input . indexOf ( "b" ) ;

    // Find the index of the character 'c' in the input string.
    // A value of -1 indicates that 'c' was not found.
    var cc = input . indexOf ( "c" ) ;


    // Conditional check: Evaluate if any of the required characters are missing.
    // The logical OR operator (||) checks if 'aa' is -1 OR 'bb' is -1 OR 'cc' is -1.
    if ( ( aa == -1 ) || ( bb == -1 ) || ( cc == -1 ) )
    {
        // If any character is not found, output "No" to the console.
        console . log ( "No" ) ;
    }
    else
    {
        // If all characters ('a', 'b', 'c') are found, output "Yes" to the console.
        console . log ( "Yes" ) ;
    }

} // End of the 'main' function definition.


/*
 * This section handles program execution:
 * 1. It uses Node.js's 'fs' module to read the entire content of standard input (/dev/stdin).
 * 2. The input is read as a UTF-8 encoded string.
 * 3. The read string is then passed as an argument to the 'main' function for processing.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// The program concludes after the main function has been called and executed.