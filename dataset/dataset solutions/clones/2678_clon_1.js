// This is an introductory comment for the entire script.
// It explains the general purpose of the JavaScript file.

// The `input` parameter will receive all the input data for processing.
function Main(   input   )
{
    // Inside the Main function, the input is typically an array of strings.
    // However, in this specific case, it seems to be a single value.

    input   =   input   ; // This line assigns the input to itself, effectively keeping its value.

    var   N   =   Number(   input   )   ; // Convert the input string into a numerical type.
    var   result   =   0   ; // Initialize a variable to store the final count, starting at zero.

    // Begin a loop that iterates through numbers.
    // The loop starts from 1 and continues as long as 'i' is less than 'N'.
    for   (   var   i   =   1   ;   i   <   N   ;   i++   )
    {
        // Within the loop, we check a condition for each number 'i'.
        // This condition evaluates if the number of digits in 'i' is odd.
        if   (   String(   i   )   .   length   %   2   ===   1   )
        {
            result++   ; // If the condition is true, increment the 'result' counter.
        }
    }

    console   .   log   (   result   )   ; // Finally, print the accumulated result to the standard output.
}


// * This section of the code should not be altered under any circumstances.
// * It is responsible for handling standard input/output operations.
// * It reads the entire content from stdin and then invokes the Main function with it.
Main   (   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;