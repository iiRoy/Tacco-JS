/*
 * This is the main processing function.
 * It takes an input string, parses it, and performs a calculation.
 */
function     main   (   input   )
{
    // Split the input string by spaces to get arguments.
    const args  =  input . split ( " " ) ;

    // Extract the first argument, which is 'A'.
    const A = args [ 0 ] ;
    // Extract the second argument, which is 'B'.
    const B = args [ 1 ] ;


    // Check a specific condition for 'B'.
    if  (  B   ===   '1'  )
    {
        // If 'B' is '1', log "0" and exit early.
        console . log ( "0" ) ;

        return // Exit the function.

    }

    // Convert string 'A' to a number.
    var a_number    =    Number ( A ) ;

    // Convert string 'B' to a number.
    var b_number    =    Number ( B ) ;


    // Initialize a_count with the numeric value of A.
    var a_count     =    Number ( A ) ;

    // Initialize a counter variable.
    var count       =    1 ;


        // Begin a loop that continues as long as a_count is less than b_number.
        while  (  a_count   <   b_number  )
        {


            // Increment the main counter.
            count ++

            // Update a_count based on a specific formula.
            a_count   =   a_count   -   1   +   a_number

        } // End of the while loop.


    // After the loop finishes, log the final count.
    console . log ( count ) ;

} // End of the main function.


// This line reads input from standard input and passes it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;