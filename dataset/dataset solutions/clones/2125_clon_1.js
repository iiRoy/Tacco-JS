/*
 * This JavaScript file processes input for a specific problem.
 * It handles string manipulation and query processing.
 * This is a Type I clone, meaning it's functionally identical
 * but with different whitespace and added comments.
 */

function    Main  (  input )  {

    // Split the entire input string by newline characters into an array of lines.
    input  =  input.split ( "\n" ) ;

    // Parse the first line for N, which represents the length of string S.
    var  N  =  parseInt ( input[0] ,  10 ) ;
    // The second line is the string S itself.
    var  S  =  input[1] ;
    // Parse the third line for Q, which represents the number of queries.
    var  Q  =  parseInt ( input[2] ,  10 ) ;

    // This variable keeps track of the starting index for query lines in the input array.
    var  nextInputnum  =  3 ;

    // Array to store parsed query strings.
    var  Querys  =  [ ] ;

    // Array to store characters of string S, allowing for efficient modification.
    var  S_arr  =  [ ] ;

    // Populate S_arr with characters from S.
    for  ( var  i  =   0 ;   i   <   N ; i ++ )
    {
        S_arr.push ( S[i] ) ;
    }

    // Read all query strings from the input.
    for  ( var  i  =  0 ;  i  <  Q  ;  i ++ )
    {
        Querys[i]  =  input[ ( nextInputnum  +  i ) ] ;
    }


    // Process each query one by one.
    for  ( var  qry  of  Querys )
    {
        // Split the query string into parts based on spaces.
        qry  =  qry.split ( " " ) ;

        // Determine the type of the current query.
        var  type  =  parseInt ( qry[0] ,  10 ) ;

        // Use a switch statement to handle different query types.
        switch  ( type )
        {
            case  1 :
                // Query type 1: Update a character in S_arr.
                var  iq  =  parseInt ( qry[1] ,  10 ) ; // Index for update (1-indexed).
                var  c   =  qry[2] ;                   // New character.

                // Only update if the character is different to avoid unnecessary operations.
                if  ( S_arr[iq-1]  !==  c )
                {
                    S_arr[iq-1]  =  c ;
                }
                break ;

            case  2 :
                // Query type 2: Count unique characters in a substring.
                var  l  =  parseInt ( qry[1] ,  10 ) ; // Left bound (1-indexed).
                var  r  =  parseInt ( qry[2] ,  10 ) ; // Right bound (1-indexed).

                // An object used as a hash set to store unique characters.
                var  result  =  { } ;

                // Check for valid range before processing.
                if  ( l  <=  r  &&  l  <  N )
                {
                    // Iterate through the specified range and add characters to the result set.
                    // The loop variable 'l' is intentionally modified here as per original code's logic.
                    for  ( l ;  l  <=  r  ;  l ++ )
                    {
                        result[S_arr[ ( l-1 ) ]]  =  null ;
                    }
                }

                // The number of unique characters is the count of keys in the result object.
                var  dup  =  Object.keys ( result ) .length ;

                // Output the count of unique characters followed by a newline.
                console.log ( "%d\n" ,  dup ) ;
                break ;

            default :
                // Handle any unexpected query types (though none are expected in this problem).
                break ;
        }
    }
}

// Main function call to start execution.
// Reads input from standard input using Node.js 'fs' module in UTF-8 encoding.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;