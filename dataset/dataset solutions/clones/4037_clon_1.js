/*
 * This file contains the solution to a simple mathematical problem.
 * It reads input, performs a calculation, and prints the result.
 * This is a Type I clone, preserving all logic and structure.
 */


function    Main (    input    )    {

    // Split the input string by newline characters to get an array of lines.
    input    =    input.split (    "\n"    )    ;

    var    x    =    parseInt (    input [    0    ] . split (    " "    ) [    0    ]    )    ; // Parse the first number from the first line.

    var    y    =    parseInt (    input [    0    ] . split (    " "    ) [    1    ]    )    ; // Parse the second number from the first line.

    var    ans    =    -1    ; // Initialize the answer variable.

    /*
     * Check if x is not perfectly divisible by y.
     * The modulo operator (%) returns the remainder of the division.
     */
    if    (    x    %    y    !=    0    )    {

        ans    =    x    ; // If there's a remainder, assign x to ans.

    }


    console.log    (    '%s'    ,    ans    )    ; // Output the final answer to the console.

}

// This line reads the input from standard input and passes it to the Main function.
Main    (    require (    "fs"    ) . readFileSync (    "/dev/stdin"    ,    "utf8"    )    )    ;

/* End of file */