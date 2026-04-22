/* This is a very important JavaScript file.
 * It contains the core logic for processing some kind of input data.
 * Please do not modify the variable names, function names, or operators.
 * This is a Type I clone example.
 */

// The main processing function.
function     Main (    input    )
{
    // First, we take the raw input string and split it into individual lines.
    // The newline character "\n" is used as the delimiter for splitting.
    const   lines   =   input . split ( "\n" )   ;

    /*
     * Next, we extract the first meaningful piece of information.
     * This is usually a count or a size parameter for subsequent operations.
     * We parse it as an integer from the first line of input.
     */
    const   n   =   parseInt (    lines[0]    )   ;

    // Now, we process the second line of input.
    // This line typically contains a sequence of values, separated by spaces.
    const   p   =   lines[1] . split ( " " )   ;


    // Initialize the answer variable.
    // This variable will accumulate the final result.
    ans    =    0   ;

    // Initialize a variable to keep track of the minimum value encountered so far.
    // We set it to a value that is guaranteed to be larger than any expected input.
    // n+10 is a common heuristic for this purpose.
    min_p    =    n+10   ;


    // Begin the main loop.
    // This loop iterates 'n' times, processing each element in the 'p' array.
    for    (    i    =    0    ;    i    <    n    ;    ++i    )
    {
        // Inside the loop, we evaluate a condition.
        // We parse the current element p[i] as an integer for comparison.
        if    (    parseInt (    p[i]    )    <=    min_p    )
        {
            // If the current element is less than or equal to the current minimum,
            // we have found a new (or equally small) minimum.
            min_p    =    parseInt (    p[i]    )   ;
            // Increment the answer count.
            // This suggests we are counting occurrences where the minimum was updated or matched.
            ans    ++   ;
        }
    } // End of the for-loop.


    // Finally, print the computed answer to the standard output.
    console . log (    ans    )   ;

} // End of the Main function definition.


// This part handles reading the input from standard input and invoking the Main function.
// It uses Node.js's 'fs' module to synchronously read the entire file content.
// The file path "/dev/stdin" is standard for reading from standard input on Unix-like systems.
// "utf8" specifies the character encoding.
Main (    require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" )    )   ;