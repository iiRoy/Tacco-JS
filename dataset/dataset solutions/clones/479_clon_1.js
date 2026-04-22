var input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ; // Reads input from standard input

// Process the input string: trim whitespace and split into an array of lines
var Arr   =   ( input . trim ( ) ) . split ( "\n" ) ;


// Main game loop that continues until a specific break condition is met
while ( true )
{
    // Extract m (number of players) and n (number of rounds) from the first line of Arr
    var mn  =   Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Check for the termination condition: both m and n are 0
    if ( mn [ 0 ]   ==   0   &&   mn [ 1 ]   ==   0 )
        break ; // Exit the loop if the termination condition is met


    // Initialize an array to hold player IDs
    var player  =   [ ] ;

    // Populate the player array with IDs from 1 to m
    for ( var i   =   0 ;   i   <   mn [ 0 ] ;   i ++ )
        player [ i ]   =   i + 1 ; // Assign player ID


    // Initialize an array to store the game rounds (expected FizzBuzz values)
    var arr =   [ ] ;

    // Read n rounds from the input array Arr
    for ( var i   =   0 ;   i   <   mn [ 1 ] ;   i ++ )
    {
        var v   =   Arr . shift ( ) ; // Get the expected value for the current round
        arr . push ( v ) ; // Add it to the rounds array
    }


    // Initialize counters for the FizzBuzz game logic
    var i   =   1 ; // Current number in the FizzBuzz sequence
    var k   =   0 ; // Index for the player array

    // Iterate through each expected value in the 'arr' (rounds)
    arr . forEach ( function ( v )
    {
        var str =   "" ; // Initialize string for FizzBuzz output

        // Check for Fizz condition
        if ( i   %   3   ==   0 )
            str   +=   "Fizz" ;

        // Check for Buzz condition
        if ( i   %   5   ==   0 )
            str   +=   "Buzz" ;

        // If neither Fizz nor Buzz, use the number itself
        if ( str   ==   "" )
            str   =   i ;

        // Compare the generated FizzBuzz string with the expected value 'v'
        // If they don't match, the player at index 'k' is eliminated
        if ( v   !=   str )
            player . splice ( k ,   1 ) ; // Remove 1 element at index k

        i ++ ; // Increment the FizzBuzz sequence counter
        k ++ ; // Move to the next player in the player array

        // If 'k' exceeds the bounds of the 'player' array, reset it to 0
        // This simulates a circular list of players
        if ( k   >=   player . length )
            k   =   0 ;
    } ) ;


    // After all rounds, print the remaining players, joined by spaces
    console . log ( player . join ( " " ) ) ;
}