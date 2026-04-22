/* This is a multi-line comment block
 * It describes the purpose of the first function.
 * This function checks for specific divisibility conditions.
 */
const   isBelow     =   (   v   )   =>  {
    // Start of the function body for isBelow
    if  (   v   %   2   ==  0   )   {
        // This line checks if v is divisible by 3.
        // The result of this expression is not used.
        v   %   3   ==  0
    }
    // End of isBelow function.
};


// This section defines the main function of the program.
// It processes input from stdin.

const   main    =   (   input   )   =>  {

    // Splitting the entire input string by newline characters.
    const   args    =   input   .   split   (   '\n'    )


    // Extracting the second line (index 1) and splitting it by spaces.
    const   nums    =   args    [   1   ]   .   split   (   ' ' )


    // Initializing the status message. Default is 'APPROVED'.
    var     mes     =   'APPROVED'


    // Iterating over each number obtained from the input.
    nums    .   forEach (   el  =>  {

        // Check if the current element 'el' is an even number.
        if  (   el  %   2   ==  0   )   {

            // If 'el' is even, perform further checks.
            // This nested 'if' checks if 'el' is NOT divisible by 3 AND NOT divisible by 5.
            if  (   !   (   (   el  %   3   ==  0   )   ||  (   el  %   5   ==  0   )   )   )
            {
                // If the condition is met, change the message to 'DENIED'.
                mes     =   'DENIED'
                // This 'return 0;' exits the current iteration of the forEach callback,
                // but the loop continues for subsequent elements.
                return  0   ;
            }
        }
    }   )


    // After processing all numbers, print the final message.
    console .   log (   mes )


}


// This is the entry point for executing the main logic.
// It reads input from '/dev/stdin' synchronously and passes it to 'main'.
main    (   require (   'fs'    )   .   readFileSync (   '/dev/stdin'    ,   'utf8'  )   )   ;