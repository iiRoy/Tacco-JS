// This is the main function that processes the input string.
function Main(input)
{
    // The input string is first split into an array of individual characters.
    // This allows easy iteration and access to each character.
    input = input.split( "" );

    // Initialize an empty array (acting as a hash map/frequency counter)
    // to store the counts of each character present in the input.
    var arr = [ ];

    // Loop through each character in the 'input' array.
    for ( var i = 0; i < input.length; i++ )
    {
        // Check if the current character has already been encountered.
        if ( arr[ input[ i ] ] )
        {
            // If yes, increment its count.
            arr[ input[ i ] ]++;
        }
        else
        {
            // If no, initialize its count to 1.
            arr[ input[ i ] ] = 1;
        }
    }

    /*
     * The following line was used for debugging purposes
     * to inspect the character frequency map.
     * console.log(arr);
     */

    // Initialize a boolean flag to true. This flag will indicate
    // whether all character counts are even (true) or if any are odd (false).
    var flag = true;

    // Iterate over the keys (characters) in the frequency array.
    Object.keys( arr ).forEach( function( key )
    {
        // Check if the count of the current character is odd.
        if ( arr[ key ] % 2 == 1 )
        {
            // If an odd count is found, set the flag to false.
            // A palindrome can only have at most one character with an odd count.
            // Since this code checks if *all* counts are even,
            // finding any odd count immediately means it's not the desired state.
            flag = false;
        }
    } );

    // Based on the final state of the 'flag', print the result.
    if ( flag )
    {
        // If all character counts were even, print "Yes".
        console.log( "Yes" );
    }
    else
    {
        // Otherwise (if at least one character count was odd), print "No".
        console.log( "No" );
    }
}

// Call the Main function with the input read from standard input.
// The input is read as a string, decoded as UTF-8, and then any
// leading/trailing whitespace is removed before passing it to Main.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );