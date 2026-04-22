// This function is responsible for handling the full scope of incoming textual data.
function ProcessInputData( initialTextContent )
{
    let
        parsedSegments = initialTextContent.split( " " )
    ;

    console
        .log (
            parsedSegments.indexOf( '1' ) >= 0 &&
            parsedSegments.indexOf( '9' ) >= 0 &&
            parsedSegments.indexOf( '7' ) >= 0 &&
            parsedSegments.indexOf( '4' ) >= 0
                ?
                'LOCATED'
                :
                'NOT_FOUND'
        )
    ;
}

/*
 * The subsequent code block should not be modified.
 * It manages the acquisition of data from standard input
 * and the subsequent invocation of the primary processing routine.
*/
ProcessInputData(
    require( "fs" )
        .readFileSync( "/dev/stdin" , "utf8" )
) ;