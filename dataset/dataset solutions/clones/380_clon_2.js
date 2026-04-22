var rawData  =  require('fs') .readFileSync('/dev/stdin',  'utf8') ; // Reads the complete input stream from standard input as a UTF-8 string

var timeLines = (rawData.replace( /\n$/ , "" )) .split("\n") ; // Cleans up the input data by removing potential trailing newlines, then splits it into an array of individual lines

var totalCases = timeLines.shift() * 1 ; // Extracts the first line, which represents the number of test cases, and converts it to a numeric type

// Begin processing each time entry supplied in the input data
for   ( var   caseIndex  =  0 ;   caseIndex  <  totalCases ;   caseIndex++ )
{
    // Splits the current time string (e.g., "10:30") into its hour and minute components
    var   timeParts   =  timeLines[caseIndex].split(":") ;

    // Parses the hour component into an integer (base 10)
    var   hourValue   =  parseInt(timeParts[0] , 10) ;

    // Parses the minute component into an integer (base 10)
    var   minuteValue  =  parseInt(timeParts[1] , 10) ;

    // Calculates the angular position of the hour hand on a 360-degree clock face
    var   hourHandAngle   =  hourValue  *  ( 360  /  12 )  +  minuteValue  *  ( ( 360  /  12 )  /  60 ) ;

    // Calculates the angular position of the minute hand on a 360-degree clock face
    var   minuteHandAngle   =  minuteValue  *  ( 360  /  60 ) ;

    // Determines the absolute difference between the hour and minute hand angles
    var   angleDifference   =  (hourHandAngle  >=  minuteHandAngle)  ?  (hourHandAngle  -  minuteHandAngle)  :  (minuteHandAngle  -  hourHandAngle) ;

    var   outcomeMessage ; // Declares a variable to store the classified message

    // Evaluates the angular difference to categorize the state
    if  ( angleDifference  >=  0  &&  angleDifference  <  30 )  {
        outcomeMessage = "alert" ; // Hands are very close, indicating an 'alert' state
    }
    else  if  ( angleDifference  >=  90  &&  angleDifference  <=  180 )  {
        outcomeMessage = "safe" ; // Hands are significantly separated, indicating a 'safe' state
    }
    else  {
        outcomeMessage = "warning" ; // All other angular differences fall into a 'warning' state
    }

    // Prints the determined outcome message to the console
    console.log(outcomeMessage) ;
}