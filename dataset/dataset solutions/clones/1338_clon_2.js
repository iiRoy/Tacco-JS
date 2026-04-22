/* This script determines the prime factors of an integer read from standard input. */
var   incomingText   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim () ;

var   processedNumber   =   parseInt ( incomingText ) ;
var   initialValue   =   processedNumber ;

var   divisorArray   =   [ ] ;

for (  var   currentDivisor   =   2 ;   currentDivisor   <=   processedNumber   /   2 ;   currentDivisor ++  )
{
    while (   processedNumber   %   currentDivisor   ===   0   )
    {
        divisorArray . push ( currentDivisor ) ;
        processedNumber   /=   currentDivisor ;
    }
}

console . log ( initialValue   +   ': '   +   divisorArray . join ( ' ' ) ) ;