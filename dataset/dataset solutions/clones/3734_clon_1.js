function    Main   ( input   ) {

    // This block processes the raw input string.
    /*
     * It performs the following steps:
     * 1. Splits the string by any whitespace characters.
     * 2. Filters out any empty strings that might result from the split.
     * 3. Maps the remaining non-empty strings to integers using base 10.
     */
    const inputs   =   input
        .split   (   / \s / g   )
        .filter  (   v   =>   v   )
        .map     (   v   =>   parseInt   (   v ,   10   )   )   ;

    // The second element (at index 1) is assigned to 'range'.
    const   range   =   inputs   [   1   ]   ;

    // The first element (at index 0) is assigned to 'arrLength'.
    const   arrLength   =   inputs   [   0   ]   ;


    // Log the computed result to the standard output.
    // The conditional (ternary) operator determines the final value.
    console
        .log   (
            range   ===   arrLength
                ?   1
                :   arrLength   /   (   range   -   1   )
        )   ;

}   // End of the Main function definition.


/*
 * This section executes the Main function.
 * It reads the input from '/dev/stdin' synchronously,
 * interpreting the content as UTF-8, and then passes it
 * to the Main function.
 */
Main   (
    require   (   "fs"   )
        .readFileSync   (   "/dev/stdin"   ,   "utf8"   )
)   ;

// This marks the end of the script.