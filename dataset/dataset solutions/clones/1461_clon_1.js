/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input from standard input, processes it, and prints a result.
 */


// The primary function that encapsulates the logic.
function       Main     (     input     )
{


    // First, process the raw input string.
    // It's trimmed to remove leading/trailing whitespace, then split by newline characters
    // to get an array where each element is a line from the input.
    var        arr      =      input
        .trim()
        .split("\n")
    ;


    // Create a Set data structure.
    // This set will contain numbers from the second line of the input (index 1).
    // The numbers on this line are space-separated.
    var        set      =      new      Set( arr[1]
        .split(" ")
        .map(Number)
    )
    ;


    // Create another array of numbers from the fourth line of the input (index 3).
    // These numbers will be iterated over and checked against the 'set'.
    var        itr      =      arr[3]
        .split(" ")
        .map(Number)
    ;


    // Initialize a result counter to zero.
    // This variable will store the final count of matching elements.
    var        res      =      0
    ;


    // Begin the main processing loop.
    // The loop iterates a number of times determined by the integer value
    // of the third line of the input (index 2).
    for
    (
        var        i        =        0        ;
        i        <        parseInt(arr[2])        ;
        i++
    )
    {
        // Inside the loop, check if the current element from 'itr'
        // exists within the 'set'.
        if      (      set.has(itr[i])      )
            res++      ;      // If it exists, increment the result counter.
    }


    // After the loop completes, print the final calculated result to the console.
    console.log(res)
    ;


} // End of the Main function definition.


// This is the entry point for the program execution.
// It reads the entire content of the standard input ("/dev/stdin")
// as a UTF-8 encoded string.
// Then, it calls the 'Main' function, passing the read content as its argument.
Main
(
    require("fs")
        .readFileSync
        (
            "/dev/stdin"
            ,
            "utf8"
        )
)
;