/*
 * This JavaScript function processes an input string to calculate a final price.
 * It demonstrates conditional logic and arithmetic operations based on parsed numeric values.
 *
 * The expected input is a single string containing multiple numeric values,
 * which are separated by either whitespace characters or newline characters.
 * These values are then stored in an array named 'args' for subsequent calculations.
 */
function   main (   input   )
{
    // Declare and initialize the 'args' array by splitting the input string.
    // The regular expression `/\s|\n/` ensures that values are separated by
    // any whitespace character (space, tab, etc.) or a newline character.
    var    args    =    input.split (    /\s|\n/    )   ;

    // Initialize the 'price' variable to zero. This variable will accumulate
    // the various components of the total price as calculated in the following blocks.
    var    price    =    0   ;


    // First major conditional block: This block determines an initial portion of the 'price'.
    // It compares the average of the first two arguments (args[0] and args[1])
    // with the third argument (args[2]). The `* 1` is used to explicitly cast
    // the string arguments to numbers for arithmetic operations.
    if    (    (    args[0]    *    1    +    args[1]    *    1    )    /    2    >    args[2]    )
    {
        // If the average of the first two arguments is greater than the third argument,
        // then 'price' is incremented by a calculation involving args[2], a multiplier of 2,
        // and the minimum value between args[3] and args[4].
        price    +=    args[2]    *    2    *    Math.min (    args[3],    args[4]    )   ;
    }
    else
    {
        // Otherwise (if the average is not greater than args[2]),
        // 'price' is incremented by a calculation involving the sum of args[0] and args[1],
        // multiplied by the minimum value between args[3] and args[4].
        price    +=    (    args[0]    *    1    +    args[1]    *    1    )    *    Math.min (    args[3],    args[4]    )   ;
    }


    // Second major conditional block: This block further adjusts the 'price'
    // based on a comparison between the fourth and fifth arguments.
    if    (    args[3]    >    args[4]    )
    {
        // If args[3] is strictly greater than args[4],
        // 'price' is incremented by args[0] multiplied by the difference (args[3] - args[4]).
        price    +=    args[0]    *    (    args[3]    -    args[4]    )   ;
    }
    else
    {
        // Otherwise (if args[3] is not greater than args[4], meaning args[4] >= args[3]),
        // 'price' is incremented by args[1] multiplied by the difference (args[4] - args[3]).
        price    +=    args[1]    *    (    args[4]    -    args[3]    )   ;
    }


    // Finally, the calculated total 'price' is outputted to the standard console.
    console.log (    price    )   ;
}

// This line executes the 'main' function.
// It reads the input from '/dev/stdin' (standard input stream, common in competitive programming environments)
// using Node.js's 'fs' (file system) module in 'utf8' encoding,
// and then passes the entire content as a string to the 'main' function.
main (    require (    'fs'    )   .readFileSync (    '/dev/stdin',    'utf8'    )    )   ;