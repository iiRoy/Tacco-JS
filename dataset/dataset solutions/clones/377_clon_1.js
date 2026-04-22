/*
 * This script processes time inputs to determine a "safety" status
 * based on the angle between the hour and minute hands of a clock.
 *
 * It reads input from /dev/stdin, which is typical for competitive programming
 * environments in Unix-like systems.
 */


// First, we import the 'fs' (file system) module to handle file operations.
var input = require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Next, we process the raw input string.
// We remove any trailing newline character to prevent issues with splitting.
// Then, we split the string into an array of lines.
var Arr = ( input . replace ( / \n $ / , "" ) ) . split ( "\n" ) ;


// The first line of the input typically contains the number of test cases (n).
// We extract this number and convert it to an integer.
// The `-0` is a common JavaScript idiom to ensure numeric conversion.
var n = Arr . shift ( ) - 0 ;

// We then loop 'n' times, processing each test case.
for ( var I = 0 ; I < n ; I ++ )
{
    // Inside the loop, each line represents a time in "HH:MM" format.
    // We split this string by the colon to get hour and minute parts.
    var arr = Arr [ I ] . split ( ":" ) ;

    // Parse the hour component into an integer (base 10).
    var h = parseInt ( arr [ 0 ] , 10 ) ;
    // Parse the minute component into an integer (base 10).
    var m = parseInt ( arr [ 1 ] , 10 ) ;


    // Calculate the angle of the hour hand (H).
    // The hour hand moves 360 degrees in 12 hours, so 30 degrees per hour.
    // It also moves an additional amount based on the minutes.
    var H = h * ( 360 / 12 ) + m * ( ( 360 / 12 ) / 60 ) ;

    // Calculate the angle of the minute hand (M).
    // The minute hand moves 360 degrees in 60 minutes, so 6 degrees per minute.
    var M = m * ( 360 / 60 ) ;

    // Calculate the absolute difference between the two hand angles.
    var hm = Math . abs ( H - M ) ;

    // The angle between hands can be measured in two directions (clockwise/counter-clockwise).
    // We want the smaller of the two angles.
    hm = Math . min ( hm , 360 - hm ) ;


    // Declare a variable to store the result string.
    var ans ;

    // Now, determine the "safety" status based on the calculated angle.
    if ( ( hm >= 0 ) && ( hm < 30 ) )
    {
        ans = "alert" ; // If the angle is very small, it's an "alert".
    }
    else if ( ( hm >= 90 ) && ( hm <= 180 ) )
    {
        ans = "safe" ; // If the angle is between 90 and 180 degrees, it's "safe".
    }
    else
    {
        ans = "warning" ; // Otherwise, it's a "warning".
    }

    // Finally, print the determined status to the console.
    console . log ( ans ) ;
}
/* End of script. */