/* This is a Type I clone of the original code.
   Whitespace and comments have been extensively altered,
   but the functional logic and all identifiers remain precisely the same.
*/

// The primary entry point for processing input data.
function Main( input )
{
    // A constant representing the modulo number, often used in competitive programming.
    var modnumber = 1000000007;

    /*
     * First, process the raw input string:
     * - Convert it into a 2D array of strings using `inputting`.
     * - Then, parse all elements into integers using `parseint_array`.
     * The result is stored in `tmp`.
     */
    var tmp = parseint_array( inputting( input ) ) ;


    // Generate all possible combinations (patterns) based on the first line of input.
    // tmp[0][0] and tmp[0][1] are typically n and k for combination generation.
    var pat = ccc( tmp[0][0], tmp[0][1] ) ; // This variable will hold all generated patterns.

    // Initialize a sum accumulator.
    var sum = 0;

    // Iterate through each generated pattern.
    for ( var i = 0 ; i < pat.length ; i++ )
    {
        // Calculate the value for the current pattern using the 'fx' function.
        // The second part of the input (tmp[1]) is likely the array of numbers to operate on.
        var result_for_pattern = fx( tmp[1], pat[i] ) ;

        // Add the result (modulo modnumber) to the total sum.
        sum += result_for_pattern % modnumber ;
    }

    // Output the final sum, ensuring it's also modulo modnumber.
    console.log( sum % modnumber ) ; // This line prints the final calculated value to standard output.
}

// This function calculates the difference between the maximum and minimum
// elements specified by a given pattern within an array.
function fx( arr, pat )
{
    // Initialize minimum and maximum values with the first element indicated by the pattern.
    var mi = arr[ pat[0] - 1 ] ; // 'pat' contains 1-based indices, so subtract 1 for 0-based array access.
    var ma = arr[ pat[0] - 1 ] ;

    // Loop through the rest of the pattern elements.
    for ( var i = 1 ; i < pat.length ; i++ )
    {
        // Update the minimum value.
        mi = Math.min( mi, arr[ pat[i] - 1 ] ) ;

        // Update the maximum value.
        ma = Math.max( ma, arr[ pat[i] - 1 ] ) ;
    }

    // For debugging, uncomment the following line:
    // console.log("f(["+pat+"]="+(ma-mi)+":"+ma+"-"+mi)

    // Return the difference between the maximum and minimum found.
    return ( ma - mi ) ;
}

// This utility function takes the raw input string and converts it
// into a 2D array of strings.
// Each line becomes a sub-array, and each word (space-separated) becomes an element.
function inputting( input )
{
    // Split the entire input string by newline characters.
    // This creates an array where each element is a line from the input.
    input = input.split( "\n" ) ;

    // Initialize an empty array to hold the processed data.
    var tmp = [] ;

    // Iterate over each line.
    for ( var i = 0 ; i < input.length ; i++ )
    {
        // For each line, split it by spaces and assign the resulting array
        // to the corresponding index in 'tmp'.
        tmp[i] = input[i].split( " " ) ;
    }

    // Return the 2D array of strings.
    return tmp ;
}


// This function takes a 2D array of strings and converts all its elements to integers.
function parseint_array( arr )
{
    // Initialize an empty 2D array to store the parsed integers.
    var ret = [] ;

    // Outer loop: iterate over rows.
    for ( var i = 0 ; i < arr.length ; i++ )
    {
        // Initialize the sub-array for the current row.
        ret[i] = [] ;

        // Inner loop: iterate over columns within the current row.
        for ( var j = 0 ; j < arr[i].length ; j++ )
        {
            // Parse the string element to an integer and store it.
            ret[i][j] = parseInt( arr[i][j] ) ;
        }
    }

    // Return the 2D array of integers.
    return ret ;
}


// This function generates combinations (n choose k) or similar patterns.
// It seems to be generating combinations of 'k' elements from a set of 'n' elements,
// where elements are 1-indexed.
function ccc( n, k )
{
    // 'ret' will store all generated combinations.
    var ret = [] ;

    // 'nowsearch' holds the current combination being built/modified.
    var nowsearch = [] ;

    // Initialize the first combination: [1, 2, ..., k].
    for ( var ii = 1 ; ii <= k ; ii++ )
    {
        nowsearch[ nowsearch.length ] = ii ;
    }

    // Main loop to generate subsequent combinations.
    for ( ; ; )
    {
        // Add a copy of the current combination to the results array.
        ret[ ret.length ] = nowsearch.concat() ;

        // 'aaa' is an index pointer, initially pointing to the last element.
        var aaa = nowsearch.length - 1 ;

        // Find the rightmost element that can be incremented.
        // It must not be at its maximum possible value for its position.
        for ( var iii = nowsearch.length - 1 ; iii >= 0 ; iii-- )
        {
            if ( nowsearch[iii] != n - ( nowsearch.length - iii - 1 ) )
            {
                break ; // Found an element that can be incremented.
            }
            else
            {
                aaa = iii - 1 ; // Move pointer left if current element is maxed out.
            }
        }

        // If 'aaa' is still valid (meaning an element can be incremented).
        if ( aaa >= 0 )
        {
            // Get the value of the element to be incremented.
            var movepoint = nowsearch[aaa] ;

            // Increment the element at 'aaa' and fill subsequent elements.
            // Subsequent elements are filled sequentially starting from (movepoint + 1).
            for ( var i4 = 0 ; i4 < nowsearch.length - aaa ; i4++ )
            {
                nowsearch[ aaa + i4 ] = movepoint + i4 + 1 ;
            }
        }
        else
        {
            // If 'aaa' is less than 0, it means all elements are at their maximum possible values,
            // so no more combinations can be generated.
            break ;
        }
    }

    // Return the array containing all generated combinations.
    return ret ;
}


/*
 * This section of the code is typically used for running the script in a specific environment
 * (e.g., a competitive programming platform).
 * It reads input from standard input and calls the Main function.
 * DO NOT EDIT BELOW THIS LINE - it's part of the boilerplate for execution.
*/
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;

// Example test cases (commented out for actual execution):
// Main("6 3\n10 10 10 -10 -10 -10") // Sample input 1
// Main("10 6\n1000000000 1000000000 1000000000 1000000000 1000000000 0 0 0 0 0") // Sample input 2