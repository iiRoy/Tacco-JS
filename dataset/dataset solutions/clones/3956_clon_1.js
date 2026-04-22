function myout ( text ) { console . log ( text ) ; } // This function provides a simple standard output mechanism.

// Main processing function for the input data.
function Main( input )
{
    // First, remove leading/trailing whitespace from the entire input string.
    input = input . trim ( ) ;

    // This line is commented out, it would split by space.
    // input = input.trim().split(" ");

    // The actual splitting strategy: divide the input into an array of strings by newline characters.
    input = input . trim ( ) . split ( "\n" ) ;

    // Another commented-out line, for splitting by space and mapping to numbers.
    // input = input.trim().split(" ").map((a)=>Number(a));

    // Yet another commented-out line, for splitting by newline and mapping to numbers.
    // input = input.trim().split("\n").map((a)=>Number(a));


    // Parse the first element of the input array as the length.
    var len = parseInt ( input [ 0 ] ) ;

    // The second element of the input array contains a space-separated list of numbers.
    // Split it, then map each string element to its numeric representation.
    var list = input [ 1 ] . split ( " " ) . map ( ( a ) => Number ( a ) ) ;


    // Initialize the sum with the absolute value of the first element in the list.
    var sum = Math . abs ( list [ 0 ] ) ;

    // Loop through the list to calculate the sum of absolute differences between adjacent elements.
    for ( var i = 0 ; i < len - 1 ; i ++ )
    {
        // Add the absolute difference between the current element and the next element to the sum.
        sum += Math . abs ( list [ i ] - list [ i + 1 ] ) ;
    }

    // Finally, add the absolute value of the last element to the sum.
    sum += Math . abs ( list [ len - 1 ] ) ;


    // This line is commented out, it was used for debugging the total sum.
    // console.log("sum:" + sum);

    // Now, iterate through the list to calculate and print the modified sum for each element.
    for ( var i = 0 ; i < len ; i ++ )
    {
        var tmp = 0 ; // Temporary variable to hold the calculated sum for the current iteration.

        // Special case: if the current element is the first one (index 0).
        if ( i == 0 )
        {
            // Subtract the absolute value of the first element and the difference between the first and second.
            // Then add the absolute value of the second element.
            tmp = sum - Math . abs ( list [ 0 ] ) - Math . abs ( list [ 0 ] - list [ 1 ] ) + Math . abs ( list [ 1 ] ) ;
        }
        // Special case: if the current element is the last one in the list.
        else if ( i == list . length - 1 )
        {
            var last = list . length - 1 ; // Store the index of the last element for clarity.

            // Subtract the absolute difference between the second-to-last and last, and the absolute value of the last.
            // Then add the absolute value of the second-to-last element.
            tmp = sum - Math . abs ( list [ last - 1 ] - list [ last ] ) - Math . abs ( list [ last ] ) + Math . abs ( list [ last - 1 ] ) ;
        }
        // General case: for any element that is not the first or the last.
        else
        {
            // Subtract the absolute differences involving the current element with its neighbors.
            // Then add the absolute difference between its two neighbors, effectively "skipping" the current element.
            tmp = sum - Math . abs ( list [ i - 1 ] - list [ i ] ) - Math . abs ( list [ i ] - list [ i + 1 ] ) + Math . abs ( list [ i - 1 ] - list [ i + 1 ] ) ;
        }

        // Output the calculated temporary sum for the current element.
        console . log ( tmp ) ;
    }

} // End of the Main function.


// Call the Main function, reading input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the core logic.