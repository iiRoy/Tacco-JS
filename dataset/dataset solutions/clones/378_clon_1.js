/*
 * This JavaScript file processes time inputs from standard input.
 * It calculates the angle between hour and minute hands on a clock
 * and categorizes the time based on this angle.
 */

// Import the 'fs' module for file system operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' ,   'utf8'   ) ;

// Process the input string: remove trailing newline and split into lines.
var Arr = ( input . replace( /\n$/ , "" ) ) . split( "\n" ) ;


// The first line of input represents the number of test cases.
var n = Arr . shift( ) - 0 ; // Convert the first element to a number.


// Loop through each test case.
for ( var I = 0 ; I < n ; I ++ ) {

    // Split the current line (time string) by the colon to get hours and minutes.
    var arr = Arr[ I ] . split( ":" ) ;

    // Parse the hour and minute parts as integers.
    var h = parseInt( arr[ 0 ] , 10 ) ;
    var m = parseInt( arr[ 1 ] , 10 ) ;

    /*
     * Calculate the angle of the hour hand (H) from 12 o'clock.
     * Hour hand moves 360 degrees in 12 hours, so 30 degrees per hour.
     * It also moves due to minutes: 30 degrees / 60 minutes = 0.5 degrees per minute.
     */
    var H = h * ( 360 / 12 ) + m * ( ( 360 / 12 ) / 60 ) ;

    // Calculate the angle of the minute hand (M) from 12 o'clock.
    // Minute hand moves 360 degrees in 60 minutes, so 6 degrees per minute.
    var M = m * ( 360 / 60 ) ;


    // Calculate the absolute difference between the hour and minute hand angles.
    var hm = Math . abs( H - M ) ;

    // Declare a variable to store the classification result.
    var ans ;

    // Classify the time based on the absolute angle difference.
    if ( hm >= 0 && hm < 30 ) {
        ans = "alert" ; // Small angle difference
    } else if ( hm >= 90 && hm <= 180 ) {
        ans = "safe" ; // Large angle difference (approx. perpendicular or opposite)
    } else {
        ans = "warning" ; // Intermediate angle difference
    }

    // Output the classification for the current test case.
    console . log( ans ) ;

} // End of loop for test cases.