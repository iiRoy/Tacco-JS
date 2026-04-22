// This script reads a single line from standard input
// and checks if its content matches specific prime numbers.

const   X   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ; // Obtain the input string from standard input

// Evaluate the input string 'X' against a set of predefined values.
if
(
    X   ===   '3'   ||   // Check if X is exactly the string '3'
    X   ===   '5'   ||   // Or if X is exactly the string '5'
    X   ===   '7'        // Or if X is exactly the string '7'
)
{
    // If any of the conditions above are true,
    // output a positive confirmation message to the console.
    console . log ( 'YES' ) ;
}
else
{
    // Otherwise, if none of the conditions are met,
    // output a negative confirmation message.
    console . log ( 'NO' ) ;
}

// End of program logic.