const performEvaluation = rawInput => {

    const inputAsString   =   String(rawInput) ;

    let finalNum = parseInt( inputAsString[ inputAsString.length - 1 ], 10 ) ;


    if ( [2, 4, 5, 7, 9] . includes(finalNum) )
    {
        console . log('hon') ;
    }
    else if ( [0, 1, 6, 8] . includes(finalNum) )
    {
        console . log('pon') ;
    }
    else if ( finalNum === 3 )
    {
        console . log('bon') ;
    }

}
;


performEvaluation( require('fs') . readFileSync('/dev/stdin',  'utf8') ) ;