/*
 * This JavaScript file contains the solution for a specific problem.
 * The main logic is encapsulated within the 'Main' function.
 * It processes input from stdin and outputs a result to stdout.
 */
function         Main   (   input   ) {

    // First, preprocess the input string.
    // It's trimmed, split by newlines, and then each line is split by spaces.
    input = input
        .trim()
        .split("\n")
        .map(
            function (   x   ) {
                return      x.split(" ")
            }
        )
    ; // End of input preprocessing.


    // Parse the number of elements 'N' from the first part of the input.
    var N = parseInt(   input[0][0]  ,  10   ) ;


    // Initialize an array to keep track of RGB counts or states,
    // though its name suggests 'without order', its values are modified.
    var RGBWithoutOrder = [   1  ,   0  ,   0   ] ;


    // Declare several temporary variables used within the loop.
    var tmp1 , tmp2 , flag ;


    // Initialize the answer variable.
    // The initial value '3' seems significant for the problem context.
    var ans = 3 ;

    /*
     * This is the core loop of the algorithm.
     * It iterates from the second element up to N-1.
     */
    for (
        var i = 1 ; // Loop starts from index 1.
        i < N ;     // Continues as long as i is less than N.
        i++         // Increment i after each iteration.
    )
    {
        // Reset tmp2 for each iteration of the outer loop.
        tmp2 = 0 ;

        // Parse the current element from the input.
        tmp1 = parseInt(   input[1][i]  ,  10   ) ;

        // Inner loop: Check how many elements in RGBWithoutOrder match tmp1.
        for (   var x   of   RGBWithoutOrder   )
        {
            if (   x   ===   tmp1   )
            {
                tmp2 ++ ; // Increment tmp2 if a match is found.
            }
        }


        // Multiply the current answer by tmp2.
        ans *= tmp2 ;


        // Apply modulo operation to keep the answer within a specific range,
        // typically used to prevent integer overflow in competitive programming.
        ans %= (   1e+9   +   7   ) ;


        // Another inner loop: Find and increment the matching element in RGBWithoutOrder.
        // This loop breaks after the first match is found and updated.
        for (   var j = 0   ;   j < 3   ;   j++   )
        {
            if (   RGBWithoutOrder[j]   ===   tmp1   )
            {
                RGBWithoutOrder[j] ++ ; // Increment the matched element.
                break ;                 // Exit the inner loop once updated.
            }
        }
    } // End of the main processing loop.


    // Output the final calculated answer to the console.
    console.log(   ans   ) ;

} // End of the Main function definition.


// This line calls the 'Main' function with input read from standard input.
// It reads the entire file content as a UTF-8 string.
Main(   require("fs").readFileSync("/dev/stdin", "utf8")   ) ;