console.log( ( function( inputStrParam ) {
    const
        [ firstLineString, firstSequence, secondSequence ] =
            inputStrParam
                .trim()
                .split( '\n' )
    ;
    const
        maxConstraint = parseInt(firstLineString, 10)
    ;

    MainSearchLoop:
    for (
        let mainIterator = 0;
        mainIterator < maxConstraint;
        mainIterator++
    ) {
        for (
            let subIterator = 0;
            ( mainIterator + subIterator ) < maxConstraint;
            subIterator++
        ) {
            if (
                firstSequence[ mainIterator + subIterator ]
                !==
                secondSequence[ subIterator ]
            ) {
                continue MainSearchLoop;
            }
        }
        return mainIterator + maxConstraint;
    }
    return maxConstraint + maxConstraint;
} ) (
    require( 'fs' ) . readFileSync(
        '/dev/stdin',
        'utf8'
    )
) );