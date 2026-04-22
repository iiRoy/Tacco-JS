/*
 * This is a JavaScript function designed to solve a specific problem.
 * It takes an input string, processes it, and then calculates a result.
 * The core logic involves a loop that accumulates a sum and checks a condition.
 */

function   Main  (   input   )
{
    // Process the input string: split by newlines, then each line by spaces.
    input  =  input . split ( "\n" ) . map ( v  =>  v . split ( " " ) ) ;


    // Extract the numerical value 'n' from the first element of the processed input.
    const   n   =   input [ 0 ] [ 0 ] ;

    // Initialize 'res' (result accumulator) to zero.
    let   res   =   0   ;

    // Initialize 'counter' to keep track of iterations.
    let   counter   =   0   ;

    /*
     * This is an infinite loop that continues until a specific condition is met.
     * It increments a value 'i' in each iteration.
     * The loop is designed to find the smallest number of terms (1 + 2 + ... + i)
     * such that the sum is divisible by 'n' and 'i' is not 1.
     */
    for  (  let   i   =   1   ;   true   ;   i ++   )
    {
        // Add the current iteration value 'i' to the running sum 'res'.
        res  +=  i   ;

        // Increment the iteration counter.
        counter ++   ;

        // Check if the current sum 'res' is perfectly divisible by 'n'
        // AND if the current iteration value 'i' is not equal to 1.
        if  (  res   %   n   ===   0   &&   i   !==   1   )
        {
            // If both conditions are true, exit the loop.
            break   ;
        }
    }


    // Output the final count to the console.
    console . log ( counter )   ;
}

// Invoke the Main function with input read from standard input.
// This line typically handles reading input in competitive programming environments.
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  )  ; // Execute the primary logic.