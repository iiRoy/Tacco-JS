/*
 * This is the main function for processing input data.
 * It takes a single string 'input' which is expected to contain
 * multiple lines of data, separated by newline characters.
 */
function Main(  input )
{
    // The first step is to split the entire input string
    // into an array of individual lines, using the newline character as a delimiter.
    input = input.split( "\n" ) ;


    // Extract the first piece of information: an integer 'N'.
    // This is parsed from the first line of the input array.
    const   N   =   parseInt(   input[0]  ,  10  )  ;

    // The second line of input is treated as a string 'S'.
    const   S   =   input[1] ;

    // The third line contains an integer 'Q', representing the total number of queries.
    const   Q   =   parseInt(   input[2]  ,  10  )  ;


    // Initialize a variable to keep track of the current line number
    // from which to read query data. It starts after N, S, and Q.
    let     nextInputnum    =   3   ;

    // Declare an empty array that will hold all the query strings.
    let     Querys  =   [ ] ;

    // Loop 'Q' times to read each query string from the input array
    // and store it in the 'Querys' array.
    for (  let   i   =   0  ;   i   <   Q   ;   i++  )
    {
        Querys[i]   =   input[   ( nextInputnum  +  i )   ]   ;
    }


    // Now, iterate through each query string stored in the 'Querys' array.
    for  (  let   qry   of   Querys  )
    {
        // For each query, split its string into individual components
        // based on space characters.
        qry   =   qry.split( " " ) ;

        // The first component of a query is its type, which is an integer.
        let   type   =   parseInt(   qry[0]  ,  10  )  ;

        // Use a switch statement to perform actions based on the query type.
        switch  (  type  )
        {
            case    1   :   // Handle queries of Type 1.
            {
                // For Type 1, parse the index 'i' and get the character 'c'.
                let   i   =   parseInt(   qry[1]  ,  10  )  ; // Index for modification.
                let   c   =   qry[2]  ;                      // New character to set.

                // Only update the character in string S if it's different from the current one.
                if  (  S[i]   !==   c  )
                {
                    S[i]    =   c   ; // Perform the character update.
                }
                break   ; // Exit the switch statement.
            }


            case    2   :   // Handle queries of Type 2.
            {
                // For Type 2, parse the left 'l' and right 'r' boundaries of a range.
                let   l   =   parseInt(   qry[1]  ,  10  )  ; // Left boundary (inclusive).
                let   r   =   parseInt(   qry[2]  ,  10  )  ; // Right boundary (exclusive).

                // Create an empty object to store unique characters found in the range.
                // Using an object's keys helps in automatically ensuring uniqueness.
                let   result    =   { } ;

                // Check for a valid range: 'l' must be less than or equal to 'r',
                // and 'l' must be within the bounds of string 'S'.
                if  (  l   <=   r   &&   l   <   N  )
                {
                    // Iterate from 'l' up to (but not including) 'r'.
                    // For each character in this range, add it as a key to the 'result' object.
                    // The value (null) doesn't matter, only the key's presence.
                    // Note: The loop condition `l` and index `S[(l-1)]` must be preserved exactly as in original.
                    for  (  l  ;   l   <   r   ;   l++  ;  )
                    {
                        result[   S[   ( l   -   1 )   ]   ]   =   null   ;
                    }
                }

                // Finally, print the count of unique characters found in the range.
                // This is determined by the number of keys in the 'result' object.
                console.log(   Object.keys(   result   ).length   )   ;
                break   ; // Exit the switch statement.
            }


            default :   // This case handles any query types that are not explicitly defined.
            {
                // No action is taken for unknown or unhandled query types.
                break   ;
            }
        }
    }
}