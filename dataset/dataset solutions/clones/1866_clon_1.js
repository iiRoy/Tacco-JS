/*
 * This is the main application module.
 * It processes input from stdin to perform a specific calculation.
 */

const   main    =   (   stdin   )   =>
{
    // Destructure the parsed input values into A, B, C, and K.
    // The input string is trimmed, split by space, and each part is converted to an integer.
    const   [   A,  B,  C,  K   ]   =   stdin
        .  trim  (  )
        .  split  (  ' '  )
        .  reduce  (  (   acc,    value   )   =>
        {
            // Parse the current string value to an integer and push it to the accumulator array.
            acc . push (  parseInt (  value  )  )  ;

            return  acc ;
        } ,   [   ]   )   ;


    // --- Logic for determining the output value ---

    // Scenario 1: If A is greater than or equal to K, output K.
    if  (   A   >=  K   )
    {
        console . log (  K  )  ;
    }
    // Scenario 2: If B is greater than or equal to the remaining K after A, output A.
    else    if  (   B   >=  K   -   A   )
    {
        console . log (  A  )  ;
    }
    // Scenario 3: Otherwise, calculate A minus the remaining K after A and B.
    else
    {
        // The calculation is A - (K - A - B)
        console . log (  A   -   (   K   -   A   -   B   )  )  ;
    }

}   ;


/*
 * This section handles reading input from standard input
 * and passing it to the main function for processing.
 * Using Node.js 'fs' module for file system operations.
 */

main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;  // Execute the main function with stdin content.