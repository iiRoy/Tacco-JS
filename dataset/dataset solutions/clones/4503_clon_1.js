/* This file enforces strict mode for better code quality. */
"use strict";


/*
 * The 'input' parameter will contain the entirety of the input data provided.
 * This function processes it to determine a specific outcome.
 */
const    main    =    (    input    )    =>    {

    // Destructure the input string into numerical components: x, a, and b.
    const    [    x,    a,    b    ]    =    input.trim().split(    "    "    ).map(    Number    );

    /*
     * Evaluate the condition based on the difference between 'b' and 'a'.
     * If the difference is negative, it implies a certain favorable state.
     */
    if    (    b    -    a    <    0    )    {

        return    "delicious";

    }

    /*
     * If the first condition is not met, check if the difference
     * is less than 'x', indicating an intermediate state.
     */
    else    if    (    b    -    a    <    x    )    {

        return    "safe";

    }

    /*
     * Otherwise, if neither of the above conditions is true,
     * the situation is considered unfavorable or critical.
     */
    else    {

        return    "dangerous";

    }

};    // End of the main function definition.


/*
 * ==============================================================================
 * DO NOT EDIT THE FOLLOWING LINES.
 * These lines are responsible for reading from standard input
 * and invoking the 'main' function with the collected data.
 * ==============================================================================
 */
console.log(    main(    require(    "fs"    ).readFileSync(    "/dev/stdin",    "utf8"    )    )    );