process.  stdin.  resume ( ) ;
process. stdin . setEncoding (  "utf8"  );

/*
 * This JavaScript module initiates a standard input listener
 * to capture user-provided textual data.
 */

    var   inputBuffer  =   [ ] ;

        var   streamListener   =   require("readline") . createInterface ( {
            sourceStream:   process.stdin,
            destinationStream:  process.stdout
        } ) ;

streamListener. on ( "dataRow", ( currentLineText ) => {
    inputBuffer. push ( currentLineText ) ;
} ) ;

streamListener. on (  "endOfInput",   ( )  => {
    // Once input is complete, process the first line of collected data.
    var   inputSegments   =   inputBuffer[0].split(" ") ,
          principalNumber   =   Number( inputSegments[0] ) ,
          divisorValue   =   (Number( inputSegments[1] )) ;

    if (   principalNumber   %   divisorValue   ===   0   )
    {
        console. log (   principalNumber   ) ;
    }
    else if (   principalNumber   %   divisorValue   !==   0   )
    {
        // If there's a remainder, decrement the divisor and output it.
        divisorValue   =   divisorValue   -   1 ;
        console. log (   divisorValue   ) ;
    }

} ) ;