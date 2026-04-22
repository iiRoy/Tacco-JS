/*
 * This JavaScript code defines a travel cost matrix 'x'
 * and then processes input to calculate adjusted travel costs.
 *
 * It reads travel segment data from standard input.
 */

var  x = {}; // Initialize an empty object to store travel costs.

// --- Travel costs from station 1 ---
x  [ "1to2" ]  =  300;
x  [ "1to3" ]  =  500;
x  [ "1to4" ]  =  600;
x  [ "1to5" ]  =  700;
x  [ "1to6" ]  =  1350;
x  [ "1to7" ]  =  1650;

// --- Travel costs from station 2 ---
x  [ "2to1" ]  =  6;
x  [ "2to3" ]  =  350;
x  [ "2to4" ]  =  450;
x  [ "2to5" ]  =  600;
x  [ "2to6" ]  =  1150;
x  [ "2to7" ]  =  1500;

// --- Travel costs from station 3 ---
x  [ "3to1" ]  =  13;
x  [ "3to2" ]  =  7;
x  [ "3to4" ]  =  250;
x  [ "3to5" ]  =  400;
x  [ "3to6" ]  =  1000;
x  [ "3to7" ]  =  1350;

// --- Travel costs from station 4 ---
x  [ "4to1" ]  =  18;
x  [ "4to2" ]  =  12;
x  [ "4to3" ]  =  5;
x  [ "4to5" ]  =  250;
x  [ "4to6" ]  =  850;
x  [ "4to7" ]  =  1300;

// --- Travel costs from station 5 ---
x  [ "5to1" ]  =  23;
x  [ "5to2" ]  =  17;
x  [ "5to3" ]  =  10;
x  [ "5to4" ]  =  5;
x  [ "5to6" ]  =  600;
x  [ "5to7" ]  =  1150;

// --- Travel costs from station 6 ---
x  [ "6to1" ]  =  43;
x  [ "6to2" ]  =  37;
x  [ "6to3" ]  =  30;
x  [ "6to4" ]  =  25;
x  [ "6to5" ]  =  20;
x  [ "6to7" ]  =  500;

// --- Travel costs from station 7 ---
x  [ "7to1" ]  =  58;
x  [ "7to2" ]  =  52;
x  [ "7to3" ]  =  45;
x  [ "7to4" ]  =  40;
x  [ "7to5" ]  =  35;
x  [ "7to6" ]  =  15;

/*
 * Reads the entire standard input.
 * The 'utf8' encoding is specified.
 */
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

/*
 * Processes the input string:
 * - Removes a trailing newline character if present.
 * - Splits the string into an array of lines.
 */
var Arr = ( input . replace( /\n$/ , "" ) ) . split( "\n" ) ;


// Main processing loop: continues until a specific condition is met.
while ( true )
{
    // Reads the starting station 's' for the current trip.
    // The '-0' converts the string to a number.
    var  s = Arr . shift( ) - 0 ;

    // If 's' is 0, it signifies the end of input, so break the loop.
    if ( s == 0 )
    {
        break ;
    }

    // Reads the departure time (hour and minute) for the trip.
    // Splits the string by space and converts parts to numbers.
    var  hm1 = ( Arr . shift( ) ) . split( " " ) . map( Number ) ;

    // Reads the destination station 'g' for the current trip.
    var  g = Arr . shift( ) - 0 ;

    // Reads the arrival time (hour and minute) for the trip.
    var  hm2 = ( Arr . shift( ) ) . split( " " ) . map( Number ) ;

    // Calculates the departure time in minutes from midnight.
    var  S = ( parseInt( hm1[0] , 10 ) * 60 ) + parseInt( hm1[1] , 10 ) ;

    // Calculates the arrival time in minutes from midnight.
    var  G = ( parseInt( hm2[0] , 10 ) * 60 ) + parseInt( hm2[1] , 10 ) ;

    var  cnt = 0 ; // Counter for discount conditions.

    /*
     * Checks the first discount condition:
     * If the departure time 'S' is before or at 1050 minutes (17:30)
     * AND arrival time 'G' is before or at 1170 minutes (19:30), OR
     * if the departure time 'S' is after or at 1050 minutes (17:30)
     * AND arrival time 'G' is before or at 1170 minutes (19:30).
     * This condition essentially checks if G <= 1170.
     */
    if ( ( S <= 1050 && G <= 1170 ) || ( S >= 1050 && G <= 1170 ) )
    {
        cnt ++ ;
    }

    /*
     * Checks the second discount condition:
     * If the travel cost from 'g' to 's' is 40 or less.
     * Note: This is an unusual condition as it uses the reverse route cost.
     */
    if ( x [ g + "to" + s ] <= 40 )
    {
        cnt ++ ;
    }

    // Retrieves the base money cost for the trip from 's' to 'g'.
    var  money = x [ s + "to" + g ] ;

    // If both discount conditions are met (cnt == 2).
    if ( cnt == 2 )
    {
        money = Math . floor( money / 2 ) ; // Halve the money.
        // Increments money until it's a multiple of 50.
        while ( money % 50 != 0 )
        {
            money ++ ;
        }
    }

    // Outputs the calculated (and possibly adjusted) money cost.
    console . log( money ) ;
}

/*
 * End of the program.
 */