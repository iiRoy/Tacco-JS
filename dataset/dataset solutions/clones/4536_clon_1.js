/*
 * This JavaScript file processes an input string to generate a balanced parenthesis string.
 * It's a re-implementation with extensive whitespace and comment variations.
 */
function  Main (  input )
{
    input  =  input.split ( "\n" ) ; /* Split the input by newline characters */

    var  num  =  parseInt ( input [ 0 ] ) ; // Parse the first line as an integer for 'num'
    var  data  =  input [ 1 ].split ( "" ) ;  // Split the second line into an array of characters
    var  ans  =  [ ] ; // Initialize an empty array for intermediate answer storage (though it's later re-declared as a string)

    var  flag  =  0 ; /* This flag indicates the current type of parenthesis being processed.
                       * 0 typically represents an opening parenthesis '(',
                       * 1 typically represents a closing parenthesis ')'.
                       * Its usage might be more nuanced based on context. */

    var  temp  =  new  Array ( num + 1 ).fill ( 0 ) ; // Create an array 'temp' of size 'num + 1' and fill it with zeros.
    var  index  =  0 ; /* This 'index' variable is used to track positions within the 'temp' array,
                       * often correlating with groups of identical consecutive characters. */

    // Initial check for the first character of the 'data' array
    if  ( data [ 0 ]  ===  ")" )
    {
        index  =  1 ; // If the first character is a closing parenthesis, update index
        flag  =  1 ; // Set the flag to indicate a closing parenthesis context
        temp [ index ] ++ ; // Increment the count at the current index in 'temp'
    }
    else
    {
        temp [ index ] ++ ; // Otherwise (if it's an opening parenthesis), just increment the count at the current index
    }


    /*
     * This loop iterates through the 'data' array starting from the second character
     * to group consecutive identical characters and store their counts in the 'temp' array.
     */
    for  ( var  i  =  1 ;  i  <  num ;  i ++ )
    {
        if  ( data [ i ]  ===  data [ i - 1 ] )
        {
            temp [ index ] ++ ; // If the current character is the same as the previous, increment count for the current group
        }
        else
        {
            index ++ ; // If the character changes, move to the next group
            temp [ index ] ++ ; // Increment count for the new group
        }
    }
    // The original code had a commented console.log(temp); here, which is now removed to vary comments.


    var  diff  =  0 ; // Variable to store the difference between counts of consecutive groups
    var  totaldiff  =  0 ; // Variable to accumulate the total difference


    // This loop calculates the total difference between counts of alternating groups in the 'temp' array.
    // It processes elements in pairs (even index vs. odd index).
    for  ( var  i  =  0 ;  i  <  num ;  i = i + 2 )
    {
        diff  =  temp [ i ]  -  temp [ i + 1 ] ; // Calculate the difference for the current pair
        totaldiff  +=  diff ; // Add this difference to the running total
        /*
         * The following block was part of the original code, but was commented out.
         * We keep it commented but with modified formatting and content.
         *
         *        if(diff > 0)
         *        {
         *            temp[i+1] += diff;
         *        }
         *        else if(diff < 0)
         *        {
         *            temp[i] -= diff;
         *        }
         */
    }

    // Original console.log(temp); was here, removed.
    // Original console.log(totaldiff); // diff+ -> ( big / diff- -> ) big was here, modified.
    // The 'totaldiff' indicates whether there's an overall surplus of opening or closing parentheses groups.

    var  ans  =  "" ; // Re-initialize 'ans' as an empty string to build the final output.
    var  index  =  num ; // Reset 'index' to 'num' for subsequent processing.


    /*
     * This complex conditional block adjusts the 'temp' array based on the 'totaldiff'
     * to ensure a balanced parenthesis structure can be formed.
     */
    if  ( totaldiff  <  0 )
    {
        temp [ 0 ]  -=  totaldiff ; // If totaldiff is negative, adjust the first group's count.
    }
    else  if  ( totaldiff  >  0 )
    {
        if  ( temp [ 0 ]  -  temp [ 1 ]  <  0 )
        {
            totaldiff  +=  temp [ 1 ]  -  temp [ 0 ] ; // Adjust totaldiff if the first two groups are unbalanced.
            temp [ 0 ]  =  temp [ 1 ] ; // Make the first group's count equal to the second's.
        }
        while  ( 1 ) // Infinite loop, expected to be broken internally.
        {
            if  ( temp [ index ]  >  0 )
            {
                if  ( index % 2  ===  0 ) // If the current index is even
                {
                    temp [ index + 1 ]  +=  totaldiff ; // Adjust the next group's count.
                    break ; // Exit the while loop.
                }
                else // If the current index is odd
                {
                    temp [ index ]  +=  totaldiff ; // Adjust the current group's count.
                    break ; // Exit the while loop.
                }
            }
            else // If the current group's count is zero or less
            {
                index -- ; // Move to the previous index.
            }
        }
    }
    else  if  ( temp [ 0 ]  -  temp [ 1 ]  <  0 )
    {
        var  difff  =  temp [ 1 ]  -  temp [ 0 ] ; // Calculate a temporary difference.
        temp [ 0 ]  =  temp [ 1 ] ; // Set the first group's count.
        while  ( 1 ) // Another infinite loop, similar to the above.
        {
            if  ( temp [ index ]  >  0  &&  index % 2  ===  0 ) // If current group has count > 0 and index is even
            {
                temp [ index + 1 ]  =  temp [ index ] ; // Copy count to the next group.
                break ; // Exit loop.
            }
            else  if  ( temp [ index ]  >  0  &&  index % 2  ===  1 ) // If current group has count > 0 and index is odd
            {
                temp [ index ]  +=  difff ; // Adjust current group's count.
                break ; // Exit loop.
            }
            else // If current group's count is zero or less
            {
                index -- ; // Move to the previous index.
            }
        }

    }

    // Original console.log(temp); was here, removed.


    /*
     * This final loop constructs the answer string 'ans' based on the adjusted counts
     * in the 'temp' array, alternating between opening and closing parentheses.
     */
    for  ( var  i  =  0 ;  i  <  num ;  i ++ )
    {
        if  ( i % 2  ===  0 ) // If the index 'i' is even (corresponds to opening parentheses groups)
        {
            for  ( var  j  =  0 ;  j  <  temp [ i ] ; j ++ )
            {
                ans  +=  "(" ; // Append an opening parenthesis for each count in the group.
            }
        }

        if  ( i % 2  ===  1 ) // If the index 'i' is odd (corresponds to closing parentheses groups)
        {
            for  ( var  j  =  0 ;  j  <  temp [ i ] ; j ++ )
            {
                ans  +=  ")" ; // Append a closing parenthesis for each count in the group.
            }
        }
    }

    console.log ( ans ) ; // Output the final constructed parenthesis string to the console.


}
Main ( require ( "fs" ).readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;