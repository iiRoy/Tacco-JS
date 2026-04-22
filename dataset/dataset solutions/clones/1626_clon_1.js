(   async   (   )    =>    {
    // This is an asynchronous self-executing function to handle standard input.

    let    input    =    ''    ;    //  Initialize an empty string to accumulate all incoming data.

    /*
     *  The following loop asynchronously reads data chunks
     *  from the standard input stream (process.stdin).
     */
    for    await    (   const    chunk    of    process.stdin   )    {
        input    +=    chunk    ;    //  Append each received chunk to the 'input' string.
    }


    const    k    =    +input    ;    // Convert the accumulated input string into a numeric value for 'k'.


    let    x    =    0    ;    // Initialize a variable 'x' to zero for subsequent calculations.

    /*
     *  This primary loop iterates from 1 up to 'k' (inclusive).
     *  It performs a specific sequence of arithmetic operations.
     */
    for    (   let    i    =    1    ;    i    <=    k    ;    i++   )    {

        x    =    x    *    10    +    7    ;    // First, update 'x' by multiplying by 10 and adding 7.

        x    %=    k    ;    // Then, apply the modulo operation with 'k' to 'x'.

        // Check if the value of 'x' has become zero after the modulo operation.
        if    (   x    ==    0   )    {
            console.log    (   i   )    ;    // If 'x' is zero, print the current iteration number 'i'.

            return    ;    // Exit the asynchronous function immediately upon finding the result.
        }
    }

    // If the loop completes without 'x' ever becoming zero, it means no such 'i' was found.
    console.log    (   -1   )    ;    // In this case, print -1 as per the problem's requirement.

}   )   (   )   ;    // End of the immediately invoked function expression.