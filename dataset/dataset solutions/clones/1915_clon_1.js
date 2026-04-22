/*
 * This is the primary function definition for the application.
 * It takes a string 'input' and processes it to determine
 * a specific financial calculation based on a starting deposit.
 */
function     Main  (   input   )
{
    // Initialize the starting deposit amount.
    let    deposit    =    100    ;

    // Parse the input string into an integer.
    // This is crucial for numerical comparisons and calculations.
    input  =  parseInt  (  input  )  ;

    /*
     * Initialize a counter variable.
     * This counter will track the number of iterations or periods.
     */
    let    count    =    0    ;

    // Begin the main loop.
    // The loop continues as long as the current 'deposit' is less than the 'input' target.
    while  (  deposit   <   input  )
    {
        // Calculate the interest for the current period.
        // Interest is 1% of the current deposit, rounded down to the nearest whole number.
        // This interest is then added back to the deposit.
        deposit     +=     Math.floor   (   deposit    *    0.01   )   ;

        // Increment the period counter for each iteration of the loop.
        count    ++    ;
    }

    /*
     * Output the final calculated count.
     * JSON.stringify is used to ensure the output is always a string representation
     * of the number, which can be useful for consistent output formatting.
     */
    console  .  log  (  JSON  .  stringify  (  count  )  )  ;
}


// This section handles the execution environment.
// It reads input from standard input (/dev/stdin) using Node.js's 'fs' module
// and passes it to the 'Main' function. This line should not be altered for execution purposes.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;