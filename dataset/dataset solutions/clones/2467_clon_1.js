/*
 * This is a JavaScript function designed to perform a specific calculation.
 * It processes input, checks conditions, and prints results to the console.
 *
 */
function         Main   (   input   ) {
    // Declare a variable to store processed arguments.
    // The input string is trimmed, split by space, and each part converted to a Number.
    var      args      =     input . trim (  ) . split (   ' '   ) . map (   Number   ) ;

    // Check a conditional expression.
    // This condition evaluates if the first argument (index 0) is NOT less than or equal to 9,
    // AND if the second argument (index 1) IS less than or equal to 9.
    if  ( ! args [ 0 ]   <=   9    &&    args [ 1 ]   <=   9    )
    {
        // If the condition is true, log the product of the two arguments.
        console . log (    args [ 0 ]    *    args [ 1 ]    ) ;
    }
    else
    {
        // If the condition is false, log the string '-1'.
        console . log (    '-1'    ) ;
    }
} // End of the Main function definition.


/*
 * Original example usage:
 * var input = `5 10`;
 * Main(input);
 *
 * The following line executes the Main function with input read from standard input.
 * This is typical for competitive programming environments.
 */
Main    (    require (    "fs"    ) . readFileSync (    "/dev/stdin"    ,    "utf8"    )    )    ;