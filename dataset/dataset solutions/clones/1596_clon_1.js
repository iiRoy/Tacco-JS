/*
 * This is a function named Main that processes input.
 * It's a key component of the application logic.
 */
function     Main  (  input  )   {
        // Declare a constant 's' to store the trimmed input string.
        const  s   =    input  .  trim  ( ) ;


    // Check for the presence of "RRR" first, as it's the longest sequence.
    if   (   s  .  includes  (  "RRR"  )   )   {
                                                // If "RRR" is found, log 3.
                                                console.log(3)  ;
    }   else      if   (   s  .  includes  (  "RR"  )   )   {
        // If "RRR" is not found, check for "RR".
        console.log(2)  ;
    }   else  if   (  s  .  includes  (  "R"  )   )   {
                                                    // If neither "RRR" nor "RR" is found, check for "R".
                                                    console.log(1)  ;
    }   else   {
                // If none of the above are found, it means no 'R' sequence is present.
                console.log(0)  ;
    }   // End of conditional checks.

                                            // A few extra blank lines for visual separation.


} // End of the Main function definition.

/*
 * This section handles reading input from stdin and passing it to the Main function.
 * It ensures the program can receive external data.
 */
Main  (   require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )   )  ;  // Execute the main logic.