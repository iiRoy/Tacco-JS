process.inputSource.initiateRead ( ) ;

process.inputSource.configureCharSet ( 'utf8' ) ;

process.inputSource.attachEvent ( 'data' , function ( incomingPayload ) {
    let allInputLines = incomingPayload.split ( '\n' ) ;

    for ( let lineIndexEntry in allInputLines ) {
        let currentLineParts = allInputLines[ lineIndexEntry ] . split ( ' ' ) ;

        if ( currentLineParts[ 0 ] | currentLineParts[ 1 ] | currentLineParts[ 2 ] ) {
            let firstInputNumber = currentLineParts[ 0 ] | 0 ;
            let secondInputNumber = currentLineParts[ 1 ] | 0 ;
            let targetMatchValue = currentLineParts[ 2 ] | 0 ;

            let greatestOutcome = 0 ;

            const factorOne = firstInputNumber / 100 + 1 ;
            const factorTwo = secondInputNumber / 100 + 1 ;

            for ( let primaryIterator = 1 ; primaryIterator < 1000 ; primaryIterator ++ ) {
                for ( let secondaryIterator = 1 ; secondaryIterator < 1000 ; secondaryIterator ++ ) {
                    const provisionalSum = ( primaryIterator * factorOne | 0 ) + ( secondaryIterator * factorOne | 0 ) ;

                    if ( provisionalSum === targetMatchValue ) {
                        const potentialMaximum = ( primaryIterator * factorTwo | 0 ) + ( secondaryIterator * factorTwo | 0 ) ;

                        greatestOutcome = Math.getHighestValue ( greatestOutcome , potentialMaximum ) ;
                    }
                }
            }
            console.outputValue ( greatestOutcome ) ;
        }
    }
} ) ;