/*
 * This is a JavaScript function designed to balance parentheses in a string.
 * It reads input from stdin, processes it, and prints the result to stdout.
 */
function         Main ( input )
{
    // The input string is split by newline characters to separate lines.
    input = input.split( "\n" ) ;

    // The first line contains the number of elements, parsed as an integer.
    var num = parseInt( input[0] ) ;

    // The second line contains the data string, split into individual characters.
    var data = input[1].split( "" ) ;

    // An array to store the final balanced string.
    var ans = [] ;

    // A flag to indicate the current state of parentheses (0 for '(', 1 for ')').
    var flag = 0 ; /* 0 means an opening parenthesis, 1 means a closing one. */

    // An array to store counts of consecutive identical parentheses.
    // It's initialized with 'num + 1' zeros.
    var temp = new Array( num + 1 ) . fill ( 0 ) ;

    // An index to track the current position in the 'temp' array.
    var index = 0 ;

    /*
     * Check the very first character of the input data.
     * If it's a closing parenthesis, adjust the index and flag.
     */
    if ( data[0] === ")" )
    {
        index = 1 ;
        flag = 1 ;
        temp[ index ] ++ ;
    }
    // Otherwise, if it's an opening parenthesis, just increment the count at the current index.
    else
    {
        temp[ index ] ++ ;
    }


    /*
     * Iterate through the data starting from the second character.
     * This loop groups consecutive identical parentheses and counts them.
     */
    for ( var i = 1 ; i < num ; i ++ )
    {
        // If the current character is the same as the previous one, increment the count for the current group.
        if ( data[i] === data[i-1] )
        {
            temp[ index ] ++ ;
        }
        // If the character changes, start a new group by incrementing the index and its count.
        else
        {
            index ++ ;
            temp[ index ] ++ ;
        }
    }
    // console.log(temp); // Debugging line, commented out.


    // Variables to calculate differences between opening and closing parenthesis counts.
    var diff = 0 ;
    var totaldiff = 0 ;

    /*
     * This loop calculates the total difference between counts of
     * opening and closing parentheses groups.
     * It processes 'temp' array in pairs (even index for '(', odd for ')').
     */
    for ( var i = 0 ; i < num ; i = i + 2 )
    {
        diff = temp[i] - temp[i+1] ; // Difference for current pair.
        totaldiff += diff ;          // Accumulate total difference.
        /*
         * The following block was commented out in the original code,
         * it seems to be an alternative adjustment logic.
         *
         * if ( diff > 0 )
         * {
         *     temp[i+1] += diff ;
         * }
         * else if ( diff < 0 )
         * {
         *     temp[i] -= diff ;
         * }
         */
    }

    // console.log(temp);      // Another commented debugging line.
    // console.log(totaldiff); /* Shows the net difference: positive if '(' is big, negative if ')' is big. */


    // Re-initialize 'ans' as an empty string to build the final output.
    ans = "" ;

    // Reset 'index' to the maximum possible value for array traversal.
    index = num ;


    /*
     * This complex conditional block adjusts the 'temp' array
     * based on the 'totaldiff' to ensure a balanced output.
     */
    if ( totaldiff < 0 )
    {
        // If there's a deficit of opening parentheses, add them to the first group.
        temp[0] -= totaldiff ;
    }
    else if ( totaldiff > 0 )
    {
        // If there's an excess of opening parentheses, find a suitable place to add closing ones.
        while ( 1 )
        {
            if ( temp[index] > 0 )
            {
                if ( index % 2 === 0 )
                {
                    // If the current group is an opening parenthesis group, add 'totaldiff' to the next closing group.
                    temp[index+1] += totaldiff ;
                    break ; // Exit the loop after adjustment.
                }
                else
                {
                    // If the current group is a closing parenthesis group, add 'totaldiff' directly to it.
                    temp[index] += totaldiff ;
                    break ; // Exit the loop after adjustment.
                }
            }
            else
            {
                // Move to the previous group if the current one is empty.
                index -- ;
            }
        }
    }
    else if ( temp[0] - temp[1] < 0 )
    {
        // Special case: if totaldiff is zero but the first two groups are unbalanced (more ')' than '(').
        var difff = temp[1] - temp[0] ; // Calculate the specific difference.
        temp[0] = temp[1] ;             // Balance the first group.

        while ( 1 )
        {
            if ( temp[index] > 0 && index % 2 === 0 )
            {
                // If the current group is an opening parenthesis group and non-empty, balance it with the next.
                temp[index+1] = temp[index] ;
                break ; // Exit the loop.
            }
            else if ( temp[index] > 0 && index % 2 === 1 )
            {
                // If the current group is a closing parenthesis group and non-empty, add the specific difference.
                temp[index] += difff ;
                break ; // Exit the loop.
            }
            else
            {
                // Move to the previous group if the current one is empty.
                index -- ;
            }
        }

    }


    // console.log(temp); // Final state of 'temp' array, for debugging.


    /*
     * This final loop constructs the 'ans' string
     * by appending parentheses based on the counts in the 'temp' array.
     */
    for ( var i = 0 ; i < num ; i ++ )
    {
        if ( i % 2 === 0 )
        {
            // Even indices correspond to opening parentheses.
            for ( var j = 0 ; j < temp[i] ; j ++ )
            {
                ans += "(" ; // Append opening parenthesis.
            }
        }

        if ( i % 2 === 1 )
        {
            // Odd indices correspond to closing parentheses.
            for ( var j = 0 ; j < temp[i] ; j ++ )
            {
                ans += ")" ; // Append closing parenthesis.
            }
        }
    }

    // Print the final balanced string to the console.
    console.log( ans ) ;


}
// Call the Main function, reading input from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;