let dataSegments = require('fs') .readFileSync('/dev/stdin', 'utf8') .replace( /,/g, "" ) .trim() .split( /\s/ );

var outputLines = [ ] ;
let currentPhrase = "";

for ( let segmentIndex = 0 ; segmentIndex < dataSegments.length ; segmentIndex++ )
{

    if ( dataSegments[segmentIndex].replace( /\./g, "" ).length < dataSegments[segmentIndex].length )
    {
        console.log( "Segment : " + dataSegments[segmentIndex] );
        if ( dataSegments[segmentIndex].replace( /\./g, "" ).length >= 3 && dataSegments[segmentIndex].replace( /\./g, "" ).length <= 6 )
        {

            if ( dataSegments[segmentIndex].search( /\./ ) === dataSegments[segmentIndex].length - 1 )
            {
                currentPhrase += dataSegments[segmentIndex].replace( /\./g, "" );
                outputLines.push( currentPhrase );
            }
            else
            {
                currentPhrase += dataSegments[segmentIndex];
            }


        }
        else
        {
            currentPhrase = "";


        }
    }
    else if ( dataSegments[segmentIndex].length >= 3 && dataSegments[segmentIndex].length <= 6 )
    {
        currentPhrase += dataSegments[segmentIndex] + " " ;
    }
}
for ( let lineIndex = 0 ; lineIndex < outputLines.length ; )
{
    console.log( outputLines[lineIndex++] ) ;
}