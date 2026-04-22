/*
 * This script processes time entries to categorize
 * the angular difference between clock hands.
 */

var rawDataContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Prepare the input data: remove trailing newline and split into individual lines.
var processedLines = ( rawDataContent . replace ( / \n $ / , "" ) ) . split ( "\n" ) ;

// Extract the total number of test cases from the first line.
var totalCases = processedLines . shift ( ) - 0 ;

// Iterate through each provided time entry.
for ( var caseIndex = 0 ; caseIndex < totalCases ; caseIndex ++ ) {

    // Split the current line (e.g., "HH:MM") into its hour and minute components.
    var timeParts = processedLines [ caseIndex ] . split ( ":" ) ;

    // Convert the hour string to an integer.
    var currentHour = parseInt ( timeParts [ 0 ] , 10 ) ;

    // Convert the minute string to an integer.
    var currentMinute = parseInt ( timeParts [ 1 ] , 10 ) ;

    /*
     * Calculate the angle of the hour hand.
     * Each hour is 30 degrees (360/12).
     * Minutes also contribute to the hour hand's movement: (30/60) = 0.5 degrees per minute.
     */
    var hourHandDegrees = currentHour * ( 360 / 12 ) + currentMinute * ( ( 360 / 12 ) / 60 ) ;

    // Calculate the angle of the minute hand.
    // Each minute is 6 degrees (360/60).
    var minuteHandDegrees = currentMinute * ( 360 / 60 ) ;

    // Determine the absolute difference between the two hand angles.
    var angularDifference = Math . abs ( hourHandDegrees - minuteHandDegrees ) ;

    // Initialize a variable to store the classification result.
    var classificationResult ;

    // Classify the time based on the angular difference.
    if ( angularDifference >= 0 && angularDifference < 30 ) {
        classificationResult = "alert" ;
    }

    else if ( angularDifference >= 90 && angularDifference <= 180 ) {
        classificationResult = "safe" ;
    }

    else {
        classificationResult = "warning" ;
    }

    // Output the determined classification for the current time entry.
    console . log ( classificationResult ) ;
}