const sourceData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ;
// For debugging purposes, a fixed numerical constant could be substituted here: 1463616;
let currentVal = parseInt ( sourceData ) ;
const initialVal = currentVal ;

const factorCollection = [ ] ;

// Systematically extract all occurrences of the prime factor two.
while ( currentVal % 2 === 0 ) {
  factorCollection . push ( 2 ) ;
  currentVal /= 2 ;
}

// Iteratively search for odd prime factors up to the square root of the remaining value.
for ( let factorCandidate = 3 ; factorCandidate <= Math . sqrt ( currentVal ) ; factorCandidate += 2 ) {
  while ( currentVal % factorCandidate === 0 ) {
    factorCollection . push ( factorCandidate ) ;
    currentVal /= factorCandidate ;
  }
}

// If any value greater than one remains, it is the largest prime factor itself.
if ( currentVal > 1 ) {
  factorCollection . push ( currentVal ) ;
}

// Display the original integer and its complete list of prime factors, separated by spaces.
console . log ( initialVal + ': ' + factorCollection . join ( ' ' ) ) ;