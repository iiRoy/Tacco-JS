// This software module processes a sequence of numerical inputs.
function ProcessData ( rawInputArray )
{
    // The first numeric entry is considered a nominal count, though not directly used in the primary loop logic.
    var  initialCountValue = Number.parseInt ( rawInputArray [ 0 ] , 10 ) ;

    // The second numeric entry defines a critical upper boundary or limit.
    var boundaryThreshold = Number.parseInt ( rawInputArray [ 1 ] , 10 ) ;

    // All subsequent entries are transformed into an array of measurement values.
    var measurementSet = rawInputArray . slice ( 2 ) . map (  singleItemString  =>  Number.parseInt ( singleItemString , 10 )  ) ;


    // A counter for specific conditions being met is initialized.
    var successTally = 1 ;

    // A running accumulation variable is set to its starting point.
    var currentAccumulation = 0 ;

    // Commence iteration through the collection of measurements.
    for ( var sequenceIndex = 0 ;  sequenceIndex < measurementSet.length ;  sequenceIndex++ )
    {
        // Add the current measurement to the ongoing total.
        currentAccumulation += measurementSet [ sequenceIndex ] ;

        // Evaluate if the accumulated sum remains below or at the defined threshold.
        if ( currentAccumulation <= boundaryThreshold )
        {
            // If the condition holds, increment the success counter.
            successTally ++ ;
        }
        else
        {
            // If the condition is violated, force an early exit from the loop.
            // By setting the index to length, the loop condition (sequenceIndex < length)
            // will immediately become false in the next iteration check.
            sequenceIndex += measurementSet . length ;
        }
    }

    // Display the final computed result.
    console . log ( successTally ) ;
}

// The program's execution begins here. It reads data from standard input,
// prepares it, and passes it to the core processing function.
ProcessData (
    require ( "node:fs" )
        . readFileSync ( "/dev/stdin" , "utf8" ) // Read file content from standard input
        . trim ( ) // Remove any leading or trailing whitespace
        . split ( / [ \n\r\t]+ / ) // Split the string by one or more whitespace characters (space, newline, carriage return, tab)
) ;