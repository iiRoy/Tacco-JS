// This script processes two numeric inputs to determine a state.
// It's a basic example demonstrating conditional logic and input parsing.

function   Main   (   input   )
{
    // First, we split the input string by spaces.
    // This assumes the two numbers are separated by a single space.
    input   =   input.split(   " "   )   ;

    // Parse the first element of the split array into an integer.
    // The radix '10' is used to ensure decimal parsing.
    var   a   =   parseInt(   input[0]   ,   10   )   ;

    // Similarly, parse the second element into an integer.
    var   b   =   parseInt(   input[1]   ,   10   )   ;

    // Now, we evaluate the condition: Is 'a' strictly greater than 'b'?
    if   (   a   >   b   )
    {
        // If the condition is true, output 'safe' to the console.
        console.log(   'safe'   )   ;
    }
    else
    {
        // Otherwise, if 'a' is not greater than 'b' (i.e., a <= b), output 'unsafe'.
        console.log(   'unsafe'   )   ;
    }

} // End of the Main function block.

// This line handles the execution of the script.
// It reads the entire content of standard input synchronously.
// The input is treated as a UTF-8 encoded string and then passed to the Main function.
Main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;