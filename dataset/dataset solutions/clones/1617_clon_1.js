/*
 * This self-executing asynchronous function
 * processes input from the standard input stream.
 * It determines an output based on a numerical comparison.
 */
(  async      (   )    =>    {
    // Initialize an empty string to accumulate input data.
    let    input     =     ''     ;

    // Asynchronously iterate over chunks received from standard input.
    for    await    (    const    chunk    of    process  .  stdin    )
    {
        // Append each received chunk to the 'input' string.
        input    +=    chunk    ;
    }

    // Convert the accumulated input string to a number.
    // Then, check if this number is greater than or equal to 30.
    if    (    +input    >=    30    )
    {
        // If the condition is true, print the string 'Yes' to the console.
        console  .  log    (    'Yes'    )    ;
    }
    // If the condition in the 'if' statement is false, execute this block.
    else
    {
        // Print the string 'No' to the console.
        console  .  log    (    'No'    )
    }
}  )  (  )  ; // End of the Immediately Invoked Function Expression (IIFE).