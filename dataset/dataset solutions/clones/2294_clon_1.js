// This function receives all input data as a single string parameter for processing.
function    Main    (    input    )    {

    // The primary input string is first split into an array of strings,
    // using the newline character as a delimiter. This effectively separates each line.
    input  =  input . split ( "\n" ) ;


    // The very first line of the input array is then further processed.
    // It is split by spaces to extract individual numerical values.
    tmp =   input [0] . split( " " );


    // The first extracted value is parsed as an integer (base 10)
    // and assigned to the variable 'takahashi'.
    var     takahashi   =   parseInt (    tmp[0]    ,    10    ) ;

    // The second extracted value is parsed as an integer (base 10)
    // and assigned to the variable 'aoki'.
    var    aoki    =    parseInt    (    tmp[1]    ,    10    )    ;

    // The third extracted value is parsed as an integer (base 10)
    // and assigned to the variable 'count', representing an operation counter.
    var count    =    parseInt    (    tmp[2]    ,    10    )    ;


    // A conditional check determines the flow of execution.
    // It evaluates if the 'count' of operations is strictly greater than 'takahashi's current value.
    if  (  count  >  takahashi  )
    {

        // If the condition is true, 'takahashi' cannot absorb all operations.
        // The remaining operations are deducted from 'aoki's value.
        count    -=    takahashi  ;

        // The result is then printed to the console: 'takahashi' becomes 0,
        // and 'aoki's value is reduced by the remaining 'count'.
        return    console.log(    0    ,    aoki    -    count    )    ;
    }
    else
    {
        // If the 'count' is not greater than 'takahashi's value,
        // a loop is initiated to decrement 'takahashi' and 'count' iteratively.

        // This loop continues as long as the 'count' of operations is not zero.
        while    (    count    !=    0    )
        {
            // Inside the loop, another condition checks if 'takahashi's value is still positive.
            if    (    takahashi    >    0    )
            {
                // If 'takahashi' is positive, its value is decremented by one.
                takahashi -- ;
            }

            // Regardless of 'takahashi's value, the operation 'count' is always decremented by one.
            count -- ;
        }

        // After the loop completes (when 'count' reaches zero),
        // the final values of 'takahashi' and 'aoki' are printed to the console.
        return    console.log    (    takahashi    ,    aoki    )    ;
    }

}


/*
 * IMPORTANT: DO NOT MODIFY THE FOLLOWING LINES OF CODE.
 * This section is responsible for standard input/output operations.
 * It reads the entire content from '/dev/stdin' (standard input)
 * as a UTF-8 encoded string and then passes it to the 'Main' function.
 */
Main (    require (    "fs"    ) . readFileSync (    "/dev/stdin"    ,    "utf8"    )    ) ;