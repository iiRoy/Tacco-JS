function    main   (  input  )
{
    // This function serves as the entry point for processing the input data.
    // It's designed to calculate costs based on a dynamic programming approach.

    // First, parse the number of items (n) from the initial input line.
    var n   =   parseInt   (   input[0]   )   ;

    // Initialize a primary array 'arr' with 'n' slots. This array will store
    // intermediate and final calculated values for each step.
    var arr =   Array   (   n   )   ;

    // Begin the main iteration loop, processing data for each item.
    // The loop runs from the first item (index 0) up to, but not including, 'n'.
    for   (   var   i   =   0   ;   i   <   n   ;   i++   )
    {
        // For each item, extract its associated costs from the input.
        // The input line for costs is at index i+1 because input[0] is 'n'.
        var cost =   input[i+1].split   (   ' '   )   ;

        // A conditional block to handle the first item (i.e., the base case).
        if   (   i   ==   0   )
        {
            // For the very first item, its costs are directly assigned.
            // These costs are parsed as integers from the 'cost' array.
            arr[0]   =   [   parseInt   (   cost[0]   )   ,   parseInt   (   cost[1]   )   ,   parseInt   (   cost[2]   )   ]   ;
        }
        else
        {
            // For all subsequent items (i > 0), calculations depend on previous results.
            // This nested loop iterates through three distinct categories (e.g., colors).
            for   (   var   j   =   0   ;   j   <   3   ;   j++   )
            {
                // Initialize a temporary variable 'max' to track a specific maximum value.
                // It's set to null initially to handle the first comparison correctly.
                var max   =   null   ;

                // Another nested loop, typically comparing against two other categories
                // from the previous step.
                for   (   var   m   =   1   ;   m   <   3   ;   m++   )
                {
                    // Calculate the index of the 'other' category using modulo arithmetic.
                    // This ensures a cyclical selection of categories.
                    var other   =   (   j   +   m   )   %   3   ;

                    // Calculate a 'newMax' value based on the previous item's 'other' category
                    // and the current item's cost for category 'j'.
                    var newMax   =   arr[i-1][other]   +   parseInt   (   cost[j]   )   ;

                    // Update 'max' if 'newMax' is greater, or if 'max' is still null.
                    // This logic effectively finds the maximum of the two options considered.
                    if   (   max   ==   null   ||   max   <   newMax   )   max   =   newMax   ;
                } // End of innermost loop (m)

                // Ensure that the current row 'arr[i]' is initialized as an array
                // before attempting to assign values to its elements.
                if   (   !   arr[i]   )   arr[i]   =   [   ]   ;

                // Assign the determined 'max' value to the appropriate slot in 'arr'.
                arr[i][j]   =   max   ;
            } // End of middle loop (j)
        } // End of 'else' block for items after the first
    } // End of outer loop (i)

    // After all calculations are complete, print the maximum value found
    // within the last row of the 'arr' array. The spread operator is used
    // to pass array elements as individual arguments to Math.max.
    console.log   (   Math.max   (   ...   arr[n-1]   )   )   ;
} // End of the 'main' function definition


// Declare and initialize a global string variable to accumulate input data.
var input   =   ''   ;


// Start listening for input from the standard input stream.
process.stdin.resume   (   )   ;

// Configure the encoding for the incoming data, typically 'utf8' for text.
process.stdin.setEncoding   (   'utf8'   )   ;

// Set up an event listener for when data chunks are received.
// Each incoming 'chunk' is appended to the 'input' string.
process.stdin.on   (   'data'   ,   function   (   chunk   )
{
    input   +=   chunk   ;
}   )   ;

// Set up an event listener for when the entire input stream has ended.
// This signifies that all data has been received.
process.stdin.on   (   'end'   ,   function   (   )
{
    // Once input is complete, split the accumulated string into an array of lines.
    input   =   input.split   (   '\n'   )   ;

    // Finally, invoke the main processing function with the prepared input array.
    main   (   input   )   ;
}   )   ;