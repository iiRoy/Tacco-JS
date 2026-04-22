// This program processes a sequence of numbers from standard input.
// It calculates a specific 'biscuit' value based on these numbers.

/*
 * The Main function is the entry point for processing the input data.
 * It takes a single string 'input' as its argument.
 */
function   Main (  input  )

{

    // Split the input string by spaces to get an array of stringified numbers.
    input  =  input . split (  ' '  ) ;


    /*
     * Parse the first element of the input array into an integer and
     * assign it to the variable K. This represents the target value.
     */
    var   K   =   parseInt (  input [ 0 ]  ) ;

    // Parse the second element into an integer, assigning it to A.
    var   A   =   parseInt (  input [ 1 ]  ) ;

    // Parse the third element into an integer, assigning it to B.
    var   B   =   parseInt (  input [ 2 ]  ) ;


    // Calculate the difference between B and A, storing it in D.
    // D represents the gain per operation cycle.
    var   D   =   B   -   A ;

    // Calculate the difference between K and A, storing it in E.
    // E represents the remaining amount to reach K from A.
    var   E   =   K   -   A ;


    // This variable will hold the final calculated 'biscuit' value.
    var   biscuit ;

    // The core logic uses a nested ternary operator for calculation.
    // First condition: If E is less than 2 OR D is less than 3.
    if  (  (  E   <   2  )  ||  (  D   <   3  )  )
    {
        // If the first condition is true, biscuit is K + 1.
        biscuit  =  (  K   +   1  ) ;
    }
    else
    {
        // If the first condition is false, evaluate the second condition:
        // Check if E is an even number.
        if  (  E   %   2   ===   0  )
        {
            // If E is even, calculate biscuit using this formula.
            biscuit  =  (  A   +   E   *   D   /   2   +   1  ) ;
        }
        else
        {
            // If E is odd, calculate biscuit using this alternative formula.
            biscuit  =  (  A   +   (  E   +   1  )   *   D   /   2  ) ;
        }
    }
    // Assign the result of the ternary operation to 'biscuit'.
    biscuit  =  (  (  E   <   2  )   ||   (  D   <   3  )  )
             ?  (  K   +   1  )
             :  (  E   %   2   ===   0  )
               ?  (  A   +   E   *   D   /   2   +   1  )
               :  (  A   +   (  E   +   1  )   *   D   /   2  )
    ;


    // Output the final calculated 'biscuit' value to the standard output.
    console . log (  biscuit  ) ;

} // End of the Main function.


// This section reads the input from the standard input stream.
// It uses Node.js's 'fs' module to read the file at '/dev/stdin'
// and decodes it as a 'utf8' string.
// The read content is then passed as an argument to the Main function.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;