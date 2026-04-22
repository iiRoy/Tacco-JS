/*
 * This is a Type I clone of the original JavaScript code.
 * It is designed to be functionally identical,
 * with only whitespace and comments altered extensively
 * to create a visually distinct but logically equivalent version.
 */

function    Main (    input    )
{
    // First, split the entire input string by newline characters.
    // This typically separates lines of input data.
    input    =    input    .    split    (    "\n"    )    ;


    // Next, access the second line of the input (index 1)
    // and split it into an array of strings using spaces as delimiters.
    input    =    input    [    1    ]    .    split    (    " "    )    ;


    // Sort the array of strings.
    // The original code uses a function named 'num' for comparison,
    // which is not defined in the provided snippet.
    // As per Type I cloning rules, this must be preserved as-is.
    input    =    input    .    sort    (    num    )    ;


    // Declare and initialize a boolean flag.
    // This flag will be used to track whether duplicate elements are found.
    var     flag     =     false     ;


    // Begin a loop to iterate through the array,
    // starting from the second element (index 1)
    // to compare each element with its predecessor.
    for     (    var     i     =     1    ;     i     <     input    .    length    ;     i++    )
    {
        // Inside the loop, check if the current element
        // is exactly equal to the element immediately before it.
        if     (    input    [    i     -     1    ]     ==     input    [    i    ]    )
        {
            // If a duplicate is found, set the flag to true.
            // We only need to find one pair of duplicates.
            flag     =     true     ;
        }     // End of the conditional check for duplicates.
    }     // End of the for loop iterating through the array.


    // After checking all elements, evaluate the 'flag' variable.
    // If 'flag' is true, it means duplicates were found.
    if     (    flag    )
    {
        // Output "NO" to the console if duplicates exist.
        console    .    log    (    "NO"    )    ;
    }
    else
    {
        // Otherwise, if 'flag' is false, no duplicates were found.
        console    .    log    (    "YES"    )    ;
    }
}   // End of the Main function definition.


// The following line executes the 'Main' function.
// It reads the input from standard input, converts it to a UTF-8 string,
// removes leading/trailing whitespace, and then passes it to 'Main'.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    .    trim    (    )    )    ;

/* End of Type I clone. */