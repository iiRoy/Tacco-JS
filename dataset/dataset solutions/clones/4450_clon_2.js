"use strict";

const processInputData = ( inputContentString ) =>
{
    const inputLineArray = inputContentString . trim ( ) . split ( "\n" ) ;


    const dimensionsRaw = inputLineArray [ 0 ] . split ( " " ) ;
    const gridRows = parseInt ( dimensionsRaw [ 0 ] ) ;
    const gridColumns = parseInt ( dimensionsRaw [ 1 ] ) ;


    const segmentValueCount = parseInt ( inputLineArray [ 1 ] ) ;
    const segmentLengthCollection = inputLineArray [ 2 ] . split ( " " ) . map ( ( numericString ) => parseInt ( numericString ) ) ;


    let expandedSequence = [ ] ;


    if ( segmentValueCount === 1 )
    {
        console . log ( 1 ) ;
        return ;
    }


    for ( let sequenceIndex = 1 ; sequenceIndex <= segmentValueCount ; sequenceIndex ++ )
    {
        for ( let repetitionIndex = 0 ; repetitionIndex < segmentLengthCollection [ sequenceIndex - 1 ] ; repetitionIndex ++ )
        {
            expandedSequence . push ( sequenceIndex ) ;
        }
    }


    let finalOutputMatrix = [ ] ;
    let currentLineSegment = [ ] ;


    for ( let elementIndex = 0 ; elementIndex < expandedSequence . length ; elementIndex ++ )
    {
        currentLineSegment . push ( expandedSequence [ elementIndex ] ) ;

        if ( elementIndex !== 0 && ( ~~elementIndex + 1 ) % gridColumns === 0 )
        {

            if ( elementIndex % 2 !== 0 )
            {
                currentLineSegment . reverse ( ) ;
            }

            finalOutputMatrix . push ( currentLineSegment . join ( " " ) ) ;
            currentLineSegment = [ ] ;
        }
    }


    console . log ( finalOutputMatrix . join ( "\n" ) ) ;
};


processInputData (
    require ( 'fs' )
        . readFileSync ( '/dev/stdin' , 'utf8' )
) ;