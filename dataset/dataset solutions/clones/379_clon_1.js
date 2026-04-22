/*
 * This JavaScript code processes time inputs from standard input.
 * It calculates angular differences between hour and minute hands on a clock
 * and classifies the time based on these differences.
 */
var    input    =     require ( 'fs' ) . readFileSync ( '/dev/stdin' ,     'utf8'     ) ;

// Remove trailing newline character if present, then split input into an array of lines.
var Arr = ( input.replace ( / \n $ / , "" ) ) . split ( " \n " ) ;

// Extract the number of test cases from the beginning of the array.
// The `-0` converts the string to a number.
var   n   =   Arr . shift ( )   -   0   ;

// Loop through each test case provided in the input array.
for ( var    I    =    0 ;    I    <    n ;    I ++ )
{
    // Split the current line by the colon to separate hours and minutes.
    var    arr    =    Arr [ I ] . split ( ":" ) ;

    // Parse the hour component as an integer with base 10.
    var    h    =    parseInt ( arr [ 0 ] , 10 ) ;

    // Parse the minute component as an integer with base 10.
    var    m    =    parseInt ( arr [ 1 ] , 10 ) ;

    /*
     * Calculate the angle of the hour hand.
     * Each hour is 30 degrees (360/12).
     * Minutes also affect the hour hand's position: 0.5 degrees per minute ((360/12)/60).
     */
    var    H    =    h    *    ( 360    /    12 )    +    m    *    ( ( 360    /    12 )    /    60 ) ;

    // Calculate the angle of the minute hand.
    // Each minute is 6 degrees (360/60).
    var    M    =    m    *    ( 360    /    60 ) ;

    // Calculate the absolute difference between the hour and minute hand angles.
    var    hm    =    Math . abs ( H    -    M ) ;

    // Declare a variable to store the classification result.
    var    ans    ;

    /*
     * Classify the time based on the angular difference.
     * - "alert" if the difference is less than 30 degrees.
     * - "safe" if the difference is between 90 and 180 degrees.
     * - "warning" for all other cases.
     */
    if   (   hm   >=   0   &&   hm   <   30   )
        ans    =    "alert"   ;

    else   if   (   hm   >=   90   &&   hm   <   180   )
        ans    =    "safe"   ;

    else
        ans    =    "warning"   ;

    // Output the classification for the current time.
    console . log ( ans ) ;
}
/* End of script. */