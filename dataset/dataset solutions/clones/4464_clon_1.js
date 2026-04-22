/*
 * This file processes input data to determine reachability.
 * Original creation date: 2017/07/29
 * Author: kagawa (as per original comment)
 */
function  main ( input )
{
    // Split the entire input string by newline characters
    input  =  input . split ( "\n" ) ;

    // Initialize arrays and a variable to track the maximum value
    var  a  =  [ ] ;
    var  b  =  [ ] ;
    var  tmp  =  [ ] ; // Temporary array for split parts
    var  N = 0 ;       // N will store the maximum value encountered in a or b

    // Loop through each line of the input
    for ( var  i = 0 ;  i < input . length ;  i ++ )
    {
        // Split the current line by space to get two numbers
        tmp = input [ i ] . split ( " " ) ;

        // Parse the first number and store it in array 'a'
        a [ i ]  =  Number ( tmp [ 0 ] ) ;

        // Update N if the current 'a' value is greater
        if ( a [ i ]  >  N )
        {
            N  =  a [ i ] ;
        }

        // Parse the second number and store it in array 'b'
        b [ i ]  =  Number ( tmp [ 1 ] ) ;

        // Update N if the current 'b' value is greater
        if ( b [ i ] > N )
        {
            N  =  b [ i ] ;
        }
    }


    // --- Core logic for path finding ---
    var  index  =  -1 ; // Current index in array 'a'

    // Outer loop: Search for starting point (value 1)
    while ( true )
    {
        // Find the next occurrence of '1' in array 'a'
        index  =  a . indexOf ( 1 ,  index + 1 ) ;

        // If '1' is not found, it's impossible to reach N
        if ( index < 0 )
        {
            console . log ( "IMPOSSIBLE" ) ;
            return ; // Exit the function
        }
        else
        {
            // Found a '1' at 'index'. Now, search for a path from b[index].

            var  index_next  =  -1 ; // Next index for inner search

            // Inner loop: Search for a path from the current node
            while ( true )
            {
                // Find the next occurrence of b[index] in array 'a'
                index_next  =  a . indexOf ( b [ index ] ,  index_next + 1 ) ;

                // If no further connection is found, break the inner loop
                if ( index_next < 0 )
                {
                    break ; // No path from current b[index]
                }
                else
                {
                    // If b[index_next] is equal to N, a path is found!
                    if ( b [ index_next ]  ==  N )
                    {
                        console . log ( "POSSIBLE" ) ;
                        return ; // Exit the function
                    }
                }
            }
        }
    } // End of outer while loop


} // End of main function

// Entry point: Read input from stdin and pass to main function
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;