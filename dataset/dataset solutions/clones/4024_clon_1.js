/*
 * This file contains a JavaScript program designed to process
 * numerical input from standard input and perform a conditional
 * check based on the processed values. It's a demonstration
 * of a Type I code clone, focusing on extensive whitespace
 * and comment modifications.
 */


function    Main    (    input    )    {

    // Step 1: Process the raw input string.
    // The input is first cleaned of leading/trailing whitespace.
    // Then, it's split into an array of strings based on newline characters.
    // Finally, each string element is converted into an integer (base 10).
    var    xs    =    input    .    trim    ( )    .    split    (    '\n'    )    .    map    (    v    =>    parseInt    (    v    ,    10    )    )    ;


    // Step 2: Calculate an intermediate value 'A'.
    // 'A' is determined by taking the first element of the 'xs' array
    // and computing its remainder when divided by 500.
    var    A    =    xs    [    0    ]    %    500    ;


    // Step 3: Evaluate a condition and output the result.
    // This block checks if 'A' is less than or equal to the second element of 'xs'.
    if    (    A    <=    xs    [    1    ]    )
    {
        // If the condition holds true, print "Yes" to the console.
        console    .    log    (    'Yes'    )    ;
    }
    else
    {
        // Otherwise, if the condition is false, print "No" to the console.
        console    .    log    (    'No'    )    ;
    }

}    // End of Main function definition.


// Program entry point:
// The 'Main' function is called with input read from the standard input.
// 'fs.readFileSync' is used for synchronous file reading from '/dev/stdin',
// and the content is interpreted as UTF-8 encoded text.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;

/*
 * End of file.
 * This program demonstrates a simple conditional logic flow.
 */