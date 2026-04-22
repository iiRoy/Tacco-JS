// This is a completely new comment added at the beginning of the file.
// It serves no functional purpose but demonstrates a Type I change.

/**
 * Main function to process the input data.
 * This function takes a single string 'input' as its argument.
 * @param {string} input - The raw input string, typically read from standard input.
 */
function         Main    (    input    )        {
    // First, we take the provided 'input' string and split it into an array
    // of strings, using the newline character ("\n") as the delimiter.
    // This effectively separates each line of the input into its own array element.
    input = input . split  (    "\n"    )    ;

    // Next, we declare a variable 'arr'.
    // We access the second element of the 'input' array (at index 1, as arrays are 0-indexed).
    // This specific line is then split further, using a single space (" ") as the delimiter,
    // creating a new array of strings which is assigned to 'arr'.
    var    arr    =    input    [    1    ]    .    split    (    " "    )    ;

    // Initialize a boolean flag named 'flag' to 'false'.
    // This variable will be used to track whether a specific condition
    // is met during the iteration process.
    var        flag        =        false        ;


    // We now iterate over each element present in the 'arr' array.
    // The forEach method calls the provided callback function once for each element.
    // The 'val' parameter in the callback represents the current element being processed.
    arr    .    forEach    (    function    (    val    )    {
        // Inside the loop, we check if the current 'val' (element from 'arr')
        // is strictly equal to the string literal "Y".
        if    (    val    ==    "Y"    )
        {
            // If the condition (val is "Y") is true, we update our 'flag' variable.
            // Note: The original code has a typo 'ture' instead of 'true'. This is preserved exactly.
            flag    =    ture    ;
        }
        // No 'else' block is present, so the flag only changes if 'val' is "Y".
    }    )    ; // End of the forEach loop's execution.

    // Finally, after the loop completes, we print a result to the console.
    // A ternary operator is used here:
    // If 'flag' is true, it will print "Four".
    // Otherwise (if 'flag' is false), it will print "Three".
    console    .    log    (    flag    ?    "Four"    :    "Three"    )    ;
} // This curly brace marks the end of the 'Main' function's definition.


// This line immediately invokes the 'Main' function.
// It reads the content of '/dev/stdin' (standard input) as a UTF-8 string.
// The 'require("fs").readFileSync' part is used to synchronously read the file.
// '.trim()' is called on the read content to remove any leading/trailing whitespace,
// including potential newline characters at the end of the input.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    .    trim    (    )    )    ;

// This is another comment added at the very end of the file.
// It further demonstrates the allowance for arbitrary comment changes in Type I clones.