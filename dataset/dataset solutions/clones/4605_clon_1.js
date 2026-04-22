/*
 * This is the main entry point for processing the input data.
 * The 'input' parameter will contain the entire raw input string.
 */
function Main ( input )
{
    // Split the input string by newline characters to get individual lines.
    input = input.split ( "\n" ) ;

    // Parse the first line to extract 'n' and 'duration'.
    var line1 = input[0].split ( " " ) ;
    var n = parseInt ( line1[0] ) ; // Number of events
    var duration = parseInt ( line1[1] ) ; // Duration of each section

    // Parse the second line which contains the event times.
    var line2 = input[1].split ( " " ) ;

    // Initialize arrays to store start and end times of sections.
    var arrSectionStart = [ ] ;
    var arrSectionEnd = [ ] ;
    var numSection = 0 ; // Counter for the current section index

    // Initialize 'time' with the first event's time.
    var time = parseInt ( line2[0] ) ;

    var ans = 0 ; // Variable to accumulate the total answer.

    // Initialize the first section.
    arrSectionStart [ 0 ] = 0 ;
    arrSectionEnd   [ 0 ] = duration ;


    // Loop through each event to calculate section overlaps and total duration.
    for ( var i = 0 ; i < n ; i++ )
    {
        // Get the current event's time.
        time = parseInt ( line2[i] ) ;

        // The following line was used for debugging purposes.
        // console.log ( "Current time:", time ) ;

        // Check if the current event falls within the active section's end time.
        if ( time <= arrSectionEnd [ numSection ] )
        {
            // If it does, extend the current section's end time.
            arrSectionEnd [ numSection ] = time + duration ;
        }
        else
        {
            // If not, the current section has ended.
            // Add its duration to the total answer.
            ans += arrSectionEnd [ numSection ] - arrSectionStart [ numSection ] ;

            // Start a new section.
            numSection ++ ;
            arrSectionStart [ numSection ] = time ;
            arrSectionEnd   [ numSection ] = time + duration ;
        }
    }

    // After the loop, add the duration of the last active section to the total.
    ans += arrSectionEnd [ numSection ] - arrSectionStart [ numSection ] ;

    // Output the final calculated answer to the console.
    console.log ( ans ) ;
}

/*
 * Do not modify the code below this line.
 * It handles reading input from stdin and calling the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;