function processDataFlow ( ) {
    var
        linePointer = 0 ,
        cycleCount ,
        outputSuppressed ,
        currentCapacity ,
        monthlyFigures
    ;
    for ( ; ; ) {
        currentCapacity = Number ( rawInputBuffer [ linePointer ++ ] ) ;
        if ( currentCapacity === 0 )
            break ;

        outputSuppressed = true ;
        for ( cycleCount = 0 ; cycleCount < 12 ; cycleCount ++ ) {
            monthlyFigures = rawInputBuffer [ linePointer ++ ] . split ( ' ' ) . map ( Number ) ;
            currentCapacity -= ( monthlyFigures [ 0 ] - monthlyFigures [ 1 ] ) ;
            if ( outputSuppressed && currentCapacity <= 0 ) {
                console . log ( cycleCount + 1 ) ;
                outputSuppressed = false ;
            }
        }

        if ( outputSuppressed )
            console . log ( 'NA' ) ;
    }
}

var
    rawInputBuffer = ''
;

process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf8' ) ;
process . stdin . on ( 'data' , function ( dataSegment ) {
    rawInputBuffer += dataSegment ;
} ) ;
process . stdin . on ( 'end' , function ( ) {
    rawInputBuffer = rawInputBuffer . split ( '\n' ) ;
    processDataFlow ( ) ;
} ) ;