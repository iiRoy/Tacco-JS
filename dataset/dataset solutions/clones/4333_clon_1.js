/*
 * This is the main function that processes the input.
 * It attempts to find a specific combination based on given parameters.
 */
var main = function    (    input    )    {

    // Split the input string by spaces and parse each part as an integer.
    // The result is stored in an array named 'Ar'.
    var Ar   =   input.split(' ').map(x=>parseInt(x))   ;


    // Extract the first element into variable N.
    var N=Ar[0]   ;

    // Extract the second element into variable M.
    var M=Ar[1]   ;

    // Extract the third element into variable K.
    var K=Ar[2]   ;


    // Initialize the answer string to 'No'.
    var Ans    =    'No'    ;


    /*
     * Start a nested loop to iterate through possible combinations.
     * The outer loop iterates from 0 to N (inclusive).
     */
    for    (    var    i    =    0    ;    i    <=    N    ;    i++    )    {

        // The inner loop iterates from 0 to M (inclusive).
        for    (    var    j    =    0    ;    j    <=    M    ;    j++    )    {

            // Check if the current combination satisfies the condition.
            // The condition is: j * (N - i) + i * (M - j) == K.
            if    (    j    *    (N    -    i)    +    i    *    (M    -    j)    ==    K    )    {

                // If the condition is met, set the answer to 'Yes'.
                Ans    =    'Yes'    ;

                // Log the affirmative answer to the console.
                console.log(Ans)    ;

                // Return 0, indicating successful completion and that a solution was found.
                return    0    ;
            }
        }
    }

    // If the loops complete without finding a solution,
    // the original code prints the string 'Ans', not the variable value.
    // This is preserved as per Type I clone rules.
    console.log('Ans')    ;

    // Return 0, indicating completion (even if no specific solution was found).
    return    0    ;
}


// Read input from standard input, decode as UTF-8, trim whitespace,
// and then pass it to the main function for processing.
main    (    require("fs").readFileSync("/dev/stdin",    "utf8").trim()    )    ;