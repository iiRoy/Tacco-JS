// This is a JavaScript program designed to process a specific input
// and then print a result based on a simple comparison.
// It uses standard input/output mechanisms.


function    Main    (    input    )
{
    // Declare a constant variable to store the parsed input array.
    // The input is first converted to a string, then split by a single space character.
    const    inputArr    =    input    .    toString    (    )    .    split    (    " "    )    ;


    // Assign the first element of the input array to a constant variable 'K'.
    const    K    =    inputArr    [    0    ]    ;


    // Assign the second element of the input array to a constant variable 'X'.
    const    X    =    inputArr    [    1    ]    ;


    // Output the values of K and X to the console, separated by a space.
    console    .    log    (    K    ,    X    )    ;


    // Perform a conditional check: if 500 times K is greater than X, print "YES".
    // Otherwise, print "NO". This is a ternary operation.
    console    .    log    (    500    *    K    >    X    ?    "YES"    :    "NO"    )
}


// The following block handles the standard input/output mechanism.
// It reads the entire content from /dev/stdin as a UTF-8 string,
// and then passes it to the Main function for processing.
// This part is crucial for execution in typical competitive programming environments.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;