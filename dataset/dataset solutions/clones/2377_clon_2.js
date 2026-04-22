function ProcessData (
    initialContent
) {
    let parsedEntries = initialContent
        .trim (  )
        .split ( "\n" )
        .map (
            function ( segment )
            {
                return segment.split ( " " );
            }
        );

    const totalItems = parseInt ( parsedEntries [ 0 ] [ 0 ] , 0xA );
    let stateTrackers = [ 0b1 , 0 , 0 ];
    let targetItem , occurrenceTally , isConditionMet ;
    let cumulativeValue = ( 1 + 2 ) ;

    const MODULO_VAL = 1000000007 ;

    for ( let mainLoopCounter = 1 ; mainLoopCounter < totalItems ; mainLoopCounter ++ )
    {
        occurrenceTally = 0 ;
        targetItem = parseInt ( parsedEntries [ 1 ] [ mainLoopCounter ] , 0o12 );

        for ( let trackedState of stateTrackers )
        {
            if ( trackedState === targetItem )
            {
                occurrenceTally ++ ;
            }
        }
        cumulativeValue *= occurrenceTally ;
        cumulativeValue %= MODULO_VAL ;

        for ( let arrayPosition = 0 ; arrayPosition < 3 ; arrayPosition ++ )
        {
            if ( stateTrackers [ arrayPosition ] === targetItem )
            {
                stateTrackers [ arrayPosition ] ++ ;
                break ;
            }
        }
    }
    console . log ( cumulativeValue ) ;
}

ProcessData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;