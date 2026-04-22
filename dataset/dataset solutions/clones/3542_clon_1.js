/*
 * This file contains utility functions and the main program logic.
 * It processes input from standard input to calculate a specific value.
 */

    // Utility function to convert a string to an integer (base 10).
    var     toInt     =     x     =>     parseInt(x,     10)     ;


    /*
     * Utility function to convert an array of strings to an array of integers.
     * It uses the 'toInt' function for each element.
     */
    var     toIntArr     =     arr     =>     arr.map(x     =>     toInt(x))     ;


    // Utility function to calculate the absolute value of a number.
    var     abs     =     x     =>     x     >     0     ?     x     :     -x     ;


/**
 *  Calculates the minimum value among the provided arguments.
 *  Note: This function uses the 'arguments' object.
 */
function     min     (     )     {
    var     rest     =     arguments     ,
        val     =     rest[0]     ;
    for     (     var     i     =     1     ;     i     <     rest.length     ;     i++     )
        if     (     rest[i]     <     val     )
            val     =     rest[i]     ;
    return     val     ;
}


/*
 *  Calculates the maximum value among the provided arguments.
 *  This function also uses the 'arguments' object.
 */
function     max     (     )     {
    var     rest     =     arguments     ,
        val     =     rest[0]     ;
    for     (     var     i     =     1     ;     i     <     rest.length     ;     i++     )
        if     (     rest[i]     >     val     )
            val     =     rest[i]     ;
    return     val     ;
}


// The main entry point of the application.
// It reads input from /dev/stdin and passes it to the Main function.
Main     (     require     (     "fs"     )     .     readFileSync     (     "/dev/stdin"     ,     "utf8"     )     )     ;


    // This is the primary function that processes the input data.
    // It takes a string 'input' which is expected to be multi-line.
function     Main     (     input     )     {
        var     input     =     input.split     (     '\n'     )     ; // Split the input string into an array of lines.

        // Process the first line of input.
        var     temp     =     toIntArr     (     input[0]     .     split     (     ' '     )     )     ;
        var     n     =     temp[0]     ; // 'n' is the first value from the first line.
        var     x     =     temp[1]     ; // 'x' is the second value from the first line.

        // Process the second line of input.
        var     xs     =     toIntArr     (     input[1]     .     split     (     ' '     )     )     ;

        // Initialize 'ss' array with the first element of 'xs'.
        var     ss     =     [     xs[0]     ]     ;

        // Calculate prefix sums for the 'xs' array and store them in 'ss'.
        for     (     var     i     =     1     ;     i     <     n     ;     i++     )     {
            ss[i]     =     xs[i]     +     ss[i-1]     ;
        }

        // Initialize the answer variable.
        var     ans     =     (     n     +     1     )     *     x     ;

        var     has     =     0     ; // Counter variable.

        // Iterate backwards through the 'xs' array to perform calculations.
        for     (     var     i     =     n     -     1     ;     i     >     -1     ;     i--     )     {
            has++     ; // Increment 'has' on each iteration.

            // Conditional logic based on 'has' and calculated values.
            if     (     has     >     2     &&     x     <     ss[i]     *     (     has     -     1     )     *     2     -     xs[i]     *     2     )     {
                has     =     1     ; // Reset 'has' if condition met.
                ans     +=     x     ; // Add 'x' to 'ans'.
            }
            // Update 'ans' with a calculated value using 'xs[i]' and 'max' function.
            ans     +=     xs[i]     *     (     max     (     has     ,     2     )     *     2     +     1     )     ;
        }

        // Output the final calculated answer to the console.
        console     .     log     (     ans     )     ;

    }