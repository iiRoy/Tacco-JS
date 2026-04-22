/*
 * This JavaScript function aims to find a specific arithmetic combination
 * from a 4-digit input string to achieve a target sum of 7.
 * It explores different combinations of addition and subtraction.
 */
function   main   (   input   )   {
    // An array to potentially store inputs, though not actively used in this version.
    var   inputs   =   [ ]   ;

    /*
     * Extract individual digits from the input string.
     * Each character is converted into its numerical representation.
     */
    var   a   =   Number   (   input.charAt   (   0   )   )   ;
    var   b   =   Number   (   input.charAt   (   1   )   )   ;

    var   c   =   Number   (   input.charAt   (   2   )   )   ;
    var   d   =   Number   (   input.charAt   (   3   )   )   ;

    // Loop through all 8 possible combinations of operators.
    // The 'op' variable is a bitmask (0-7) representing the three operators.
    // Bit 0 for op1, Bit 1 for op2, Bit 2 for op3.
    for   (   var   op   =   0   ;   op   <   8   ;   op++   )   {
        // Debugging output: shows the derived values for each operator's sign.
        // These values are used to switch between addition and subtraction.
        console.log   (   (   op   &   1   )   *   2   ,   (   op   &   2   )   ,   (   op   &   4   )   /   2   )   ;

        // Check if the current combination of operators results in the sum of 7.
        // The expression `(1 - (op & X) * Y)` effectively toggles between +1 and -1
        // to simulate addition or subtraction based on the bitmask.
        if   (
                a
                +   b   *   (   1   -   (   op   &   1   )   *   2   )   // Operator between 'a' and 'b'
                +   c   *   (   1   -   (   op   &   2   )   )       // Operator between 'b' and 'c'
                +   d   *   (   1   -   (   op   &   4   )   /   2   )   // Operator between 'c' and 'd'
                ===   7
        )   {
            // If the target sum (7) is achieved, construct the result string.
            // The ternary operator `(op & X) ? '-' : '+'` selects the correct sign.
            return   a
                     +   (   (   op   &   1   )   ?   '-'   :   '+'   )
                     +   b
                     +   (   (   op   &   2   )   ?   '-'   :   '+'   )
                     +   c
                     +   (   (   op   &   4   )   ?   '-'   :   '+'   )
                     +   d
                     +   '=7'   ;
        }
    }
}


// This part of the code reads input from standard input,
// passes it to the `main` function, and then prints the returned result to the console.
console.log   (   main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   )   ;