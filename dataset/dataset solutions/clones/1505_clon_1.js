const   main    =   (   arg )   =>  {
    /*
     * Extract the first line of the input to determine N.
     * The `split("\n")[0]` operation retrieves the very first line.
     */
    let     N   =   arg .   split   (   "\n"    )   [   0   ]   ;

    // Reassign 'arg' to contain only the subsequent lines, effectively removing the first line.
    arg =   arg .   split   (   "\n"    )   .   splice  (   1   )   ;

    // Create array D1 by mapping each remaining line to its first space-separated part.
    let D1  =   arg .   map (   x   =>  x .   split   (   " " )   [   0   ]   )   ;

    // Create array D2 by mapping each remaining line to its second space-separated part.
    let D2  =   arg .   map (   x   =>  x .   split   (   " " )   [   1   ]   )   ;


    // Initialize a counter to track consecutive matches.
    let     count   =   0   ;

    // Initialize a boolean flag, which will be set to true if the condition is met.
    let     isSame  =   false   ;

    /*
     * Loop through the elements from 0 up to N-1 (inclusive).
     * This loop compares corresponding elements in D1 and D2.
     */
    for (   let     i   =   0   ;   i   <   N   ;   i   ++  )
    {
        // Check for strict equality between the i-th elements of D1 and D2.
        if  (   D1  [   i   ]   === D2  [   i   ]   )
        {
            // If they are equal, increment the consecutive match counter.
            count   ++  ;

            // If the counter reaches 3 or more, the condition is satisfied.
            if  (   count   >=  3   )
            {
                isSame  =   true    ; // Set the flag to true.
            }
        }
        else
        {
            // If elements are not equal, reset the counter for consecutive matches.
            count   =   0   ;
        }
    }


    // Output "Yes" if isSame is true, otherwise output "No".
    console .   log (   isSame  ?   "Yes"   :   "No"    )   ;

}

/*
 * Invoke the main function.
 * It reads the entire content of standard input as a UTF-8 string.
 * This is a common pattern for competitive programming in Node.js.
 */
main    (   require (   "fs"    )   .   readFileSync (   "/dev/stdin"    ,   "utf8"  )   )   ;