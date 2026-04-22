/* This is a Type I clone of a JavaScript program.
 * It preserves the exact same logic, identifiers, and expressions
 * as the original code, but introduces significant variations
 * in whitespace (indentation, spacing, newlines) and comments.
 * This makes the code visually distinct while maintaining
 * functional equivalence.
 */


    var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire input file as a UTF-8 string.


        /*
         *   The input string is first trimmed to remove any leading/trailing whitespace,
         *   then split into an array of strings based on newline characters.
         *   Each element of 'Arr' will be a line from the input.
         */
    var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Start of the main processing loop. This loop continues until a specific termination condition is met.
    while ( true )
    {

        // Extract the first element from 'Arr', convert it to a number, and assign it to 'n'.
        // The '- 0' trick ensures explicit numeric conversion.
        var n = Arr . shift ( ) - 0 ;

        // Check if the current value of 'n' is zero. If so, it signals the end of input data.
        if ( n === 0 )
        {
            // Exit the infinite loop.
            break ;
        }


            /*
             *   For the current test case, retrieve the next line from 'Arr'.
             *   This line contains space-separated numbers.
             *   Split the string by spaces and then map each resulting string
             *   to its numeric equivalent using the 'Number' constructor.
             *   The result is stored in the 'arr' variable.
             */
        var arr = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;


        // This loop iterates through all possible positions 'i' where an element might be missing.
        // Since there are 'n' elements in an arithmetic progression of length 'n+1',
        // 'n+1' iterations are needed to check each possibility.
        for ( var i = 0 ; i < n + 1 ; i ++ )
        {

            // Create a temporary array 'a' by filtering out the element at the current index 'i'
            // from the original 'arr'. This simulates 'arr[i]' being the missing element.
            var a = arr . filter ( function ( v , index )
                                        {
                                            return i != index ;
                                        }
                                  ) ;

                // Calculate the common difference 'h' based on the first two elements
                // of the filtered array 'a'. This assumes 'a' is an arithmetic progression.
            var h = a [ 1 ] - a [ 0 ] ;

            // Initialize a boolean flag. It will be set to 'false' if 'a' is not an AP.
            var flag = true ;

                /*
                 *   Iterate through the elements of the filtered array 'a', starting from the second element.
                 *   Check if the difference between consecutive elements consistently matches 'h'.
                 */
            for ( var j = 1 ; j < n ; j ++ )
            {
                // If any difference does not match 'h', then 'a' is not an arithmetic progression.
                if ( h != a [ j ] - a [ j - 1 ] )
                {
                    flag = false ; // Set the flag to indicate that 'a' is not an AP.
                }
            }


            // After checking all elements, if 'flag' is still true, it means 'a' is a valid AP.
            // Therefore, 'arr[i]' (the element that was filtered out) is the missing term.
            if ( flag == true )
            {
                break ; // Found the missing element, so exit the inner 'for' loop.
            }

        } // End of the 'for' loop that searches for the missing element.


        // Print the element 'arr[i]' which was identified as the missing one.
        console . log ( arr [ i ] ) ;

    } // End of the main 'while' loop.

// End of the JavaScript program.