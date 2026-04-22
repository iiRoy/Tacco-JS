/*
 * This file contains a JavaScript program.
 * It is designed to solve a specific problem.
 * Please ensure 'use strict' mode is enabled for best practices.
 */
'use strict'; // Enforce strict parsing and error handling in the script.


/*
 * The main function serves as the entry point for the program's logic.
 * It takes an 'input' array, typically parsed from standard input.
 *
 * @param {string[]} input - An array of strings, where each string is a line of input.
 */
const    main    =    input    =>    {


    // Parse the first line of input.
    // It's expected to contain space-separated integers.
    // The `map` function converts each string part into an integer.
    const    num    =    input[0]    .    split    (    ' '    )    .    map    (    val    =>    parseInt    (    val    )    )    ;


    // Destructure the parsed numbers into individual variables for clarity.
    // n: total number of elements or positions.
    // a: position of the first entity.
    // b: position of the second entity.
    let    n    =    num[0]    ,    a    =    num[1]    ,    b    =    num[2]    ;


    // Calculate the absolute distance between the two entities.
    // This is simply the difference between their positions.
    let    dist    =    b    -    a    ;


    // Calculate two potential 'reach' values:
    // l: steps to reach the first entity from the beginning (b-1).
    // r: steps to reach the second entity from the end (n-a).
    let    l    =    b    -    1    ,    r    =    n    -    a    ;


    // Check if the distance between the two entities is odd.
    // The modulo operator (%) returns the remainder of a division.
    if    (    dist    %    2    )    {

        // If the distance is odd, the problem likely involves finding the minimum of two paths.
        // The ternary operator `l > r ? r : l` selects the smaller of 'l' and 'r'.
        console    .    log    (    l    >    r    ?    r    :    l    )    ;

    }    else    {

        // If the distance is even, the solution is simply half of the distance.
        console    .    log    (    dist    /    2    )    ;

    }


}


// --- Program Execution Start ---
// Read input from standard input (e.g., a file or console pipe).
// The input is expected to be UTF-8 encoded.
// The entire input string is then split into an array of lines.
// Finally, the 'main' function is invoked with this processed input.
main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    .    split    (    '\n'    )    )    ;
// --- Program Execution End ---