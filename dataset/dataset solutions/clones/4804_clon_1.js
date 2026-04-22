// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been modified.
// All identifiers, operators, and expressions remain strictly identical.

/**
 * The primary function to process the given input.
 * It expects a string input representing a simple arithmetic expression.
 * For example: "10 + 5" or "20 - 7".
 */
function   Main  (  input  )
{
    // First, process the raw input string.
    // Trim any leading or trailing whitespace, then split the string
    // into an array of substrings based on spaces.
    input    =    input  .  trim()  .  split(  " "  )  ;

    // Extract the first number from the parsed input array.
    // It's located at index 0 and needs to be converted to an integer.
    var   mae   =   parseInt(  input[0]  )  ;

    // Extract the second number from the parsed input array.
    // This number is expected to be at index 2.
    var   ato   =   parseInt(  input[2]  )  ;

    // Now, determine the operation based on the character at index 1.
    if  (  input[1]    ==    "+"  )
    {
        // If the operator is a plus sign, perform addition.
        console.log(  mae   +   ato  )  ;
    }
    else
    {
        // Otherwise, if it's not '+', assume it's '-' and perform subtraction.
        console.log(  mae   -   ato  )  ;
    }

    // The Main function has completed its execution.
}

// This line handles reading the input from standard input (/dev/stdin)
// and passes it to the Main function for processing.
// It uses Node.js's 'fs' module to synchronously read the file content.
Main  (  require(  "fs"  )  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;