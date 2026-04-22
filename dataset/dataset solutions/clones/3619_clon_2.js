function executeComputation( initialString )
{ // This function processes an input string to calculate a remainder.
    initialString = initialString.split('\n') ;
    initialString = initialString.split(' ');
    initialString[0] = parseInt(initialString[0], 10);
    initialString[1] = parseInt(initialString[1], 10) ;
    console.log( initialString[0] % initialString[1] );
}

executeComputation ( require('fs').readFileSync('/dev/stdin', 'utf8') ) ;