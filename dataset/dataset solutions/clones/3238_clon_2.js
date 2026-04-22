// The complete textual data from standard input is passed to this routine.
// 7
// zenkoku
// touitsu
// program

function AnalyzeTextSegments( receivedContent )
{
	// The initial line resides at the zero index, the subsequent line at index one, and so forth.
	let contentLines = receivedContent.split( "\n" ) ;

    let lineCountValue = parseInt( contentLines[0], 10 ) ;

    let stringOneSegments = contentLines[1].split( "" ) ;

    let stringTwoSegments = contentLines[2].split( "" ) ;

    let stringThreeSegments = contentLines[3].split( "" ) ;

    let mismatchScore = 0 ;

    for ( let currentPos = 0; currentPos < lineCountValue; currentPos++ )
    {
        if ( stringOneSegments[currentPos] === stringTwoSegments[currentPos] && stringTwoSegments[currentPos] === stringThreeSegments[currentPos] )
        {
            continue ;
        }

        if ( stringOneSegments[currentPos] === stringTwoSegments[currentPos] || stringTwoSegments[currentPos] === stringThreeSegments[currentPos] || stringThreeSegments[currentPos] === stringOneSegments[currentPos] )
        {
            mismatchScore++ ;
            continue ;
        }

        mismatchScore++ ;
        mismatchScore++ ;
    }

	console.log( mismatchScore ) ;
}
// * Do not modify the following line; it handles input/output and function invocation.
AnalyzeTextSegments( require("fs").readFileSync("/dev/stdin", "utf8") ) ;