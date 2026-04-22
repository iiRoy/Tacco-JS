/*
 * This routine processes an input string to detect a specific pattern.
 */
function  checkString  ( textData )
{

 let   evaluationResult  =  'Yes';

 textData  =   String( textData ) ;

    textData.split( 'hi' ) . forEach(  ( segmentChunk ) =>
    {
        if  (  segmentChunk.length   >   0   )
        {
            evaluationResult   =   'No';
        }
    } ) ;


    console.log( evaluationResult ) ;
}


checkString( require('fs').readFileSync('/dev/stdin', 'UTF-8') );