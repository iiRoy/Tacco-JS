"use strict" ;

const processInputData = ( rawData ) => {
    rawData = rawData.trim( ) . split ( "\n" ) ;
    const targetNumber = parseInt ( rawData [ 0 ] ) ;
    const targetLength = ( '' + targetNumber ) . length ;

    const allowedDigits = [ '3' , '5' , '7' ] ;
    const candidateNumbers = [ 3 , 5 , 7 ] ;

    let countOfValidNumbers = 0 ;
    let startIndexForNextIteration = 0 ;

    // This section systematically generates all numbers composed solely of '3', '5', and '7'
    // up to a length slightly less than the target number's length.
    for ( let currentLengthIndex = 0 ; currentLengthIndex < targetLength - 1 ; currentLengthIndex ++ ) {
        let currentCandidatesSize = candidateNumbers . length ;
        for ( let digitIndex = 0 ; digitIndex < 3 ; digitIndex ++ ) {
            for ( let previousCandidateIndex = startIndexForNextIteration ; previousCandidateIndex < currentCandidatesSize ; previousCandidateIndex ++ ) {
                candidateNumbers . push ( Number ( allowedDigits [ digitIndex ] + candidateNumbers [ previousCandidateIndex ] ) ) ;
            }
        }

        startIndexForNextIteration = currentCandidatesSize ;
    }

    // Now, filter the generated numbers to count those that are less than or equal to the target
    // AND contain at least one occurrence of each digit ('3', '5', '7').
    for ( let currentCandidateIdx = 0 ; currentCandidateIdx < candidateNumbers . length ; currentCandidateIdx ++ ) {
        if ( candidateNumbers [ currentCandidateIdx ] > targetNumber ) {
            break ;
        }

        const currentNumberDigits = String ( candidateNumbers [ currentCandidateIdx ] ) . split ( '' ) ;

        if ( currentNumberDigits . includes ( '3' ) && currentNumberDigits . includes ( '5' ) && currentNumberDigits . includes ( '7' ) ) {
            countOfValidNumbers ++ ;
        }
    }

    console . log ( countOfValidNumbers ) ;
}
processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;