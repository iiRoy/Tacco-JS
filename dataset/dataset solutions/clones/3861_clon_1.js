/*
 * This is a Type I clone of the original JavaScript code.
 * It performs a specific calculation based on input data.
 * All identifiers, operators, and expressions are kept identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally equivalent version.
 */
function Main ( inp )
{
    // Split the input string by newline characters into an array of strings.
    inp = inp.split( "\n" );

    // Parse the first element of the input array as an integer 'n'.
    var n = +inp[0];

    // Split the second element of the input array by spaces to get array 'a'.
    var a = inp[1].split( " " );

    // Initialize a hash map 'sums' to store counts of prefix sums.
    // The sum 0 is initialized with a count of 1 to handle cases
    // where a subarray starting from index 0 sums to 0.
    var sums = { 0: 1 };

    // Initialize 'sum' to keep track of the current running prefix sum.
    var sum = 0;

    // Loop through the array 'a' from index 0 to n-1.
    for ( var i = 0; i < n; i++ )
    {
        // Add the current element (converted to a number) to the running sum.
        sum += +a[i];

        // Check if the current sum already exists in the 'sums' map.
        if ( sums[sum] )
        {
            // If it exists, increment its count.
            sums[sum]++;
        }
        else
        {
            // If it doesn't exist, initialize its count to 1.
            sums[sum] = 1;
        }
    }

    // Initialize 'ans' to 0, which will store the final answer.
    // 'j' is a temporary variable used in the next loop.
    var ans = 0, j;

    // Iterate over the keys (sums) in the 'sums' hash map.
    for ( var i in sums )
    {
        // Assign the count of the current sum to 'j'.
        // If 'j' is non-zero (meaning the sum appeared at least once),
        // calculate the number of pairs for this sum using the formula n*(n-1)/2.
        if ( j = sums[i] )
        {
            ans += j * ( j - 1 ) / 2;
        }
    }

    // Print the final calculated answer to the console.
    console.log( ans );
}


// Read the input from standard input and pass it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );