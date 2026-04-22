/*
 * This JavaScript program processes time inputs and determines a status
 * based on the angle difference between hour and minute hands on a clock.
 * It reads input from standard input, parses it, performs calculations,
 * and prints a status for each time entry.
 *
 */

// Import the 'fs' (file system) module to read input synchronously.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Process the raw input: first, remove any trailing newline character,
// then split the entire string into an array of lines.
var Arr = ( input . replace ( /\n$/ , "" ) ) . split ( "\n" ) ;

// The first element of the array 'Arr' contains the number of test cases.
// Shift it off the array and convert it to a number (using -0 trick).
var n = Arr . shift ( ) - 0 ;


// Begin a loop that iterates 'n' times, once for each test case.
for ( var I = 0 ; I < n ; I ++ )
{
    // For the current test case, split the time string (e.g., "HH:MM")
    // into its hour and minute components using the colon as a delimiter.
    var arr = Arr [ I ] . split ( ":" ) ;

    // Parse the hour component (first element of 'arr') into an integer.
    // The radix 10 is specified for base-10 parsing.
    var h = parseInt ( arr [ 0 ] , 10 ) ;
    // Parse the minute component (second element of 'arr') into an integer.
    var m = parseInt ( arr [ 1 ] , 10 ) ;

    // Calculate the angle of the hour hand from the 12 o'clock position.
    // Hour hand moves 360/12 degrees per hour, and an additional (360/12)/60 degrees per minute.
    var H = h * ( 360 / 12 ) + m * ( ( 360 / 12 ) / 60 ) ;

    // Calculate the angle of the minute hand from the 12 o'clock position.
    // Minute hand moves 360/60 degrees per minute.
    var M = m * ( 360 / 60 ) ;

    /*
     * Determine the absolute difference between the hour hand angle (H)
     * and the minute hand angle (M). This gives the angle between the hands.
     * A ternary operator is used to ensure a non-negative result.
     */
    var hm = ( H >= M ) ? H - M : M - H ;

    // Declare a variable 'ans' to store the classification result.
    var ans ;

    // Classify the time based on the calculated angle 'hm'.
    // There are three possible states: "alert", "safe", or "warning".
    if ( hm >= 0 && hm < 30 )
    {
        ans = "alert" ; // Small angle difference indicates an 'alert' state.
    }
    else if ( hm >= 90 && hm <= 180 )
    {
        ans = "safe" ; // Large angle difference indicates a 'safe' state.
    }
    else
    {
        ans = "warning" ; // Any other angle difference falls into the 'warning' state.
    }

    // Output the determined status to the console for the current test case.
    console . log ( ans ) ;
}