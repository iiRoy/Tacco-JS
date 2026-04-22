/*
 * This function, named Main, serves as the primary entry point
 * for processing the entire input data provided to it.
 * The 'input' parameter will contain all the necessary data.
 */
function     Main    (    input    )
{


    /*
     * The following lines are commented out as they represent
     * alternative input parsing strategies not currently in use
     * for this particular problem's logic.
     * For instance, splitting by newline characters is not required here.
     */
    // input = input.split("\n");


    // Initialize the 'ans' variable, which will store our calculated result.
    // It is set to a starting value of zero before any processing begins.
    ans    =    0


    /*
     * The input string is now split into an array of individual characters.
     * Each character will be processed sequentially to determine its effect on 'ans'.
     */
    input    =    input.split    (    ""    )


    // We iterate over each character 'i' in the 'input' array.
    input    .    forEach    (    function    (    i    )
    {


        // Conditional check: if the current character is a hyphen ('-').
        if
        (
            i
            ===
            '-'
        )
        {
            // If it is a hyphen, decrement the 'ans' counter.
            ans--
        }
        else
        {
            // Otherwise (if it's any character other than a hyphen),
            // increment the 'ans' counter.
            ans++
        }


    }    )


    // The large block of commented-out code from the original has been removed
    // as per the Type I definition allowing removal of comments.
    // This code was related to a different problem context and is not relevant here.


    // Finally, the computed answer is printed to the console.
    // A newline character is explicitly appended for proper output formatting.
    console    .    log    (    ans    +    '\n'    )

} /* End of Main function */


/*
 * IMPORTANT: DO NOT MODIFY THE CODE BELOW THIS LINE.
 * This section is responsible for reading input from standard input
 * and invoking the 'Main' function with the retrieved data.
 * It ensures the program can be executed in a standard environment.
 */
Main
(
    require
    (
        "fs"
    )
    .
    readFileSync
    (
        "/dev/stdin",
        "utf8"
    )
)


/*
 * This line provides an alternative mechanism for testing the code
 * by reading input from a local file named 'input.txt'.
 * It is commented out for standard production execution.
 */
// Main(require('fs').readFileSync('./input.txt', 'utf-8'));