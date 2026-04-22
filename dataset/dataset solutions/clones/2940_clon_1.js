function Main( input )
{
    // This function processes the given input string to solve a specific problem.

    // Split the entire input string into an array of individual lines.
    lines = input . split ( '\n' )

    // Extract the first line, which typically contains N and M values.
    // Then, split this line by space to get an array of strings.
    l = lines . shift ( ) . split ( ' ' )

    // Convert the first element of 'l' to a number and assign it to 'n'.
    n = l [ 0 ] * 1

    // Convert the second element of 'l' to a number and assign it to 'm'.
    m = l [ 1 ] * 1


    // Extract the next line, which contains initial 'c' values (costs/values).
    // Split these values by space, convert them to numbers, and sort them in ascending order.
    cs = lines . shift ( ) . split ( ' ' ) . sort ( function ( a, b ) {
        // The comparison function for ascending numerical sort.
        return a - b
    } )

    // Remove the last element from the 'lines' array.
    // This often removes an empty string resulting from a trailing newline in the input.
    lines . pop ( )

    // Sort the remaining 'lines' (which represent 'ls' or item descriptions)
    // in descending order based on their second numeric component.
    ls = lines . sort ( function ( a, b ) {
        // Split each line to access its components.
        // Compare the second component (index 1) numerically in descending order.
        return b . split ( ' ' ) [ 1 ] - a . split ( ' ' ) [ 1 ]
    } )


    // Initialize an index for iterating through the 'cs' array.
    idx = 0

    // Iterate through each item in the sorted 'ls' array.
    for ( i = 0 ; i < ls . length ; i ++ )
    {
        // Split the current 'ls' item string into its components.
        l = ls [ i ] . split ( ' ' )

        // Convert the first component to a number, representing 'b' (count).
        b = l [ 0 ] * 1

        // Convert the second component to a number, representing 'c' (value).
        c = l [ 1 ] * 1


        // Loop 'b' times, decrementing 'b' in each iteration.
        while ( b -- )
        {
            // Check if 'idx' has gone beyond the bounds of the 'cs' array.
            if ( cs [ idx ] === undefined )
                break ; // If so, no more 'cs' elements to process, exit inner loop.

            // If the current 'cs' value is less than the current 'c' value,
            // update 'cs' value to 'c'.
            if ( cs [ idx ] < c )
            {
                cs [ idx ] = c
            }
            else
            {
                // If cs[idx] is not less than c, it means we can't improve
                // the current cs[idx] with c, and since cs is sorted
                // and ls is sorted in a specific way, further cs elements
                // won't be improved by this 'c' either.
                break ;
            }

            // Move to the next element in the 'cs' array.
            idx ++
        }

        // After processing all 'b' items for the current 'ls' entry,
        // check if 'idx' has exceeded 'cs' array bounds.
        // If it has, no more 'cs' elements can be updated, so exit the outer loop.
        if ( cs [ idx ] === undefined )
            break ;
    }

    // Calculate the sum of all elements in the modified 'cs' array.
    // The 'reduce' function applies a callback against an accumulator and each element.
    ans = cs . reduce ( function ( a , c ) {
        // 'a' is the accumulator (running total), 'c' is the current element.
        // Convert 'c' to a number explicitly before adding to ensure numerical sum.
        return a + c * 1
    } , 0 ) // Initialize the accumulator 'a' with 0.

    // Print the final calculated answer to the console.
    console . log ( ans )
}


// The entry point of the script.
// It reads input from standard input (/dev/stdin) as a UTF-8 string.
// Then, it calls the 'Main' function with this input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;