/*
 * This file contains a JavaScript program designed to solve a specific
 * numerical problem involving BigInt arithmetic and a loop.
 *
 * It processes input from standard input, performs calculations,
 * and outputs a final result to standard output.
 *
 * Author: Code Clone Generator (Type I)
 * Date: [Current Date, though I won't put an actual date, just a placeholder]
 */


        const   Main  =   input   =>
        {
// Initialize input processing
  const   input_sp        =   input.split  (  ' '  )
                               .map (  e   =>   BigInt (  e  )  ) ;

    /*
     * Extract numerical parameters N and K from the processed input array.
     * N is the initial value, K is the decrement step.
     */
    const  N = input_sp[0] ;
      const  K = input_sp[1] ;


    // Declare and initialize working variables for the loop
    let x_prev = N ;
        let x = N ;
            let result ; // This will hold the final computed result


    // Main loop: continues indefinitely until a break condition is met
    while (   true   )
    {
            /*
             * Calculate the next value of x by subtracting K from x_prev.
             * Then, ensure x is non-negative by taking its absolute value if it's negative.
             * Note: -1n is used to ensure BigInt negation.
             */
            x   =   x_prev   -   K ;
                x   =   x   >   0   ?   x   :   -1n*x ;

            // Log current state for debugging or intermediate output
            console.log (   `${x_prev}\n${x}`   ) ;


            // Check for the first break condition: x equals K
            if  (   x   ===   K   )
            {
                result  =   0 ; // Special case: result is zero
                    break ; // Exit the loop
            }

            // Check for the second break condition: x is less than K
            if  (   x   <   K   )
            {
                // Nested condition: x is less than half of K
                if  (   x   <   K   /   2n   )
                {
                    result  =   x ; // Result is x itself
                        break ; // Exit the loop
                }
            }

            // Update x_prev for the next iteration
            x_prev  =   x ;
    }


    /*
     * After the loop terminates, convert the BigInt result to a standard Number
     * and print it to the console.
     */
    console.log (   Number (  result  )   ) ;
        } ; // End of Main function definition


// Execute the Main function with input read from standard input.
// The 'fs' module is used to read file content, and '/dev/stdin' is the path
// for standard input on many Unix-like systems. 'utf8' specifies the encoding.
Main (   require (  'fs'  ) . readFileSync (  '/dev/stdin' ,   'utf8'  )   ) ;