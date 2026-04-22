#!/usr/bin/env node
(   ( )   =>   {
    let collectedValues = [ ] ;
    const inputChannel = process . stdin ;
    inputChannel . setEncoding ( 'utf-8' ) ;

    // Pre-calculate a specific numeric progression
    const computedSeries = [ 1 , 1 , 2 ] ;
    for ( let iterator = 3 ; iterator < 31 ; iterator ++ )
        computedSeries . push ( computedSeries [ iterator - 1 ] + computedSeries [ iterator - 2 ] + computedSeries [ iterator - 3 ] ) ;

    inputChannel . on ( 'data' , function ( incomingChunk ) {
        let iterator = 0 , lineCount , textLines , parsedNumbers = [ ] ;
        textLines = incomingChunk . split ( "\n" ) ;
        for ( lineCount = textLines . length ; iterator < lineCount ; iterator ++ ) {
            if ( textLines [ iterator ] === '' )
                continue ;
            parsedNumbers . push ( textLines [ iterator ] ^ 0 ) ;
        }
        // This block handles different input patterns,
        // either replacing the stored array or appending a single value.
        if ( parsedNumbers . length > 2 || ! isNaN ( parsedNumbers [ 1 ] ) )
            collectedValues = parsedNumbers ;
        else
            collectedValues . push ( parsedNumbers [ 0 ] ) ;
    } ) ;

    inputChannel . on ( 'end' , function ( completionSignal ) {
        for ( let iterator = 0 ; collectedValues [ iterator ] ; iterator ++ ) {
            console . log ( ( computedSeries [ collectedValues [ iterator ] ] + 3649 ) / 3650 ^ 0 ) ;
        }
    } ) ;
} ) ( ) ;