// This is the main function definition. It takes 'input' as its argument.
function Main(  input  )
{
    // First, the input string is split into an array of strings based on newline characters.
    input = input.split( "\n" );

    // Parse the first line of input to extract three integer values: n, z, and w.
    // n represents the number of elements in a sequence.
    var n = parseInt( input[0].split( " " )[0] );

    // z is the second integer from the first line.
    var z = parseInt( input[0].split( " " )[1] );

    // w is the third integer from the first line.
    var w = parseInt( input[0].split( " " )[2] );


    // The second line of input contains space-separated numbers. These are stored temporarily in 'tmp'.
    tmp = input[1].split( " " );

    // Initialize the variable 'ans' (answer) to zero.
    ans = 0;

    // Create a new array 'a' of size 'n' and fill it with zeros initially.
    a = new Array( n ).fill( 0 );

    // Loop through the 'tmp' array to convert its string elements to integers and populate array 'a'.
    for ( i = 0 ; i < n ; i++ )
    {
        // Each element of 'a' is set to the integer value of the corresponding 'tmp' element.
        a[ i ] = parseInt( tmp[ i ] );
    }


    // Initialize 'max' to 0, assuming non-negative numbers or a starting point for comparison.
    var max = 0;

    // Initialize 'min' to a very large number to ensure any array element will be smaller.
    var min = 1000000000;

    // Iterate through the array 'a' to find its maximum and minimum values.
    for ( i = 0 ; i < n ; i++ )
    {
        // Update 'max' if the current element 'a[i]' is greater than the current 'max'.
        max = Math.max( max , a[ i ] );

        // Update 'min' if the current element 'a[i]' is less than the current 'min'.
        min = Math.min( min , a[ i ] );
    }

    // Calculate the final answer. It's the maximum of three absolute differences:
    // 1. Absolute difference between 'max' and 'w'.
    // 2. Absolute difference between 'max' and the last element of 'a' (a[n-1]).
    // 3. Absolute difference between the last element of 'a' (a[n-1]) and 'min'.
    ans = Math.max( Math.abs( max - w ) , Math.abs( max - a[ n - 1 ] ) , Math.abs( a[ n - 1 ] - min ) );


    // Print the calculated answer to the console, formatted as a string.
    console.log( '%s' , ans );
}


// This line reads input from standard input using Node.js file system module.
// The content is read as UTF-8 and then passed to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );