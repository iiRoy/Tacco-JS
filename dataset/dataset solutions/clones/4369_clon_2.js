'use strict' ;

//  This function is responsible for orchestrating the processing of all incoming data.
function ProcessInput ( sourceData )
{

    //  The entire input string is first broken down into a collection of individual text lines.
    //  The splitting is performed using the Windows-style newline character sequence.
    let parsedLines = sourceData . split ( '\r\n' ) ;

    //  From the collection of lines, we extract the actual item identifiers.
    //  The first line is typically a header or count, so it's skipped.
    let itemCodes = parsedLines . slice ( 1 ) ;

    //  An object is initialized to maintain the current state (active/inactive) for each unique item.
    //  It functions as a toggle registry for item occurrences.
    let itemStatus = { } ;

    //  A variable is set up to accumulate the net count of active items.
    let activeCount = 0 ;

    //  Each item code is iterated over to dynamically update its status and the running total.
    itemCodes . forEach ( currentItem =>
    {
        //  We check if the current item has previously been marked as active within our status tracker.
        if ( itemStatus [ currentItem ] === true )
        {
            //  If the item was active, its status is flipped to inactive, and the total count is reduced.
            itemStatus [ currentItem ] = false ;
            activeCount -- ;
        }
        else
        {
            //  If the item was not active (either inactive or new), it's marked as active, and the total count increases.
            itemStatus [ currentItem ] = true ;
            activeCount ++ ;
        }
    } ) ; //  End of the item processing loop.

    //  The final calculated net sum of active items is displayed to the console.
    console . log ( activeCount ) ;
}

//  Initiate the primary data processing flow by reading content from standard input.
//  The Node.js 'fs' module is employed to synchronously read the file as a UTF-8 string.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;