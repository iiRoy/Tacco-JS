/* The complete source text will be provided to this routine */
function AnalyzeNumber(  sourceText )    {

    // The first line is at lineSegments[0], the second at lineSegments[1], etc.
    sourceText = sourceText.split( "\n" ) ;

    /* To transform a text string into a base-10 integer, utilize parseInt */
    let  targetValue  =  parseInt( sourceText[0] ,   10 ) ;

    for ( let  currentFactor = 9 ; currentFactor > 0 ; currentFactor -- ) {

        if ( targetValue % currentFactor == 0 ) {

            if ( targetValue / currentFactor < 10 ) {
                console.log( 'Yes' ) ;
                break;
            } else {
                console.log( 'No' ) ;
                break;
            }
        }
    }

    // This line was previously uncommented, but is now disabled.

}
/* Do not alter any code below this point (it handles reading from standard input and invoking the main routine) */
AnalyzeNumber( require("fs").readFileSync( "/dev/stdin" , "utf8" ) );