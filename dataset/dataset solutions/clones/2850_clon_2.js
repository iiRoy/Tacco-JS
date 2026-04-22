'use strict' ;

process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf-8' ) ;

let rawInputData = '' ;
let processingIndex = 0 ;

process . stdin . on ( 'data' , ( chunkOfData ) => {
    rawInputData += chunkOfData ;
} ) ;

process . stdin . on ( 'end' , ( ) => {
    rawInputData = rawInputData . split ( '\n' ) ;
    executeProgram ( ) ;
} ) ;

function getNextLine ( ) {
    return rawInputData [ processingIndex ++ ] ;
}

function computeMaximumScore ( targetSize , costArray , valueArray ) {
    let memoTable = Array ( targetSize + 1 ) . fill ( 0 ) ;

    for ( let currentIter = 0 ; currentIter <= targetSize ; currentIter ++ ) {
        let bestOutcome = currentIter ;

        for ( let itemIndex = 0 ; itemIndex < 3 ; itemIndex ++ ) {
            if ( currentIter >= costArray [ itemIndex ] ) {
                let candidateOutcome = memoTable [ currentIter - costArray [ itemIndex ] ] + valueArray [ itemIndex ] ;
                if ( bestOutcome < candidateOutcome ) {
                    bestOutcome = candidateOutcome ;
                }
            }
        }
        memoTable [ currentIter ] = bestOutcome ;
    }
    return memoTable [ targetSize ] ;
}

function executeProgram ( ) {
    const limitValue = parseInt ( getNextLine ( ) , 10 ) ;
    const itemWeights = getNextLine ( ) . split ( ' ' ) . map ( ( itemTxt ) => parseInt ( itemTxt , 10 ) ) ;
    const itemScores = getNextLine ( ) . split ( ' ' ) . map ( ( valTxt ) => parseInt ( valTxt , 10 ) ) ;

    let initialScore = computeMaximumScore ( limitValue , itemWeights , itemScores ) ;
    let ultimateScore = computeMaximumScore ( initialScore , itemScores , itemWeights ) ;

    console . log ( ultimateScore ) ;
}