"use strict" ;

const processInputData = ( sourceText ) => {
    sourceText = sourceText . trim ( ) . split ( "\n" ) ;
    const firstCount = parseInt ( sourceText [ 0 ] . split ( " " ) [ 0 ] ) ;
    const secondCount = parseInt ( sourceText [ 0 ] . split ( " " ) [ 1 ] ) ;

    // If the absolute difference between the two input quantities is greater than one,
    // it's impossible to arrange them alternately.
    if ( Math . abs ( firstCount - secondCount ) > 1 ) {
        console . log ( 0 ) ;
        return ;
    }

    const primeDivisor = 1000000007 ; // A large prime constant for modular arithmetic.
    let calculatedProduct = 1 ;

    // Perform factorial-like multiplication for the first quantity, modulo the prime divisor.
    for ( let idxA = 1 ; idxA <= firstCount ; idxA ++ ) {
        calculatedProduct = ( calculatedProduct % primeDivisor ) * ( idxA % primeDivisor ) ;
    }

    // Continue the factorial-like multiplication for the second quantity.
    for ( let idxB = 1 ; idxB <= secondCount ; idxB ++ ) {
        calculatedProduct = ( calculatedProduct % primeDivisor ) * ( idxB % primeDivisor ) ;
    }

    // Adjust the final outcome based on whether the two counts are identical.
    // If they are equal, there are two possible arrangements; otherwise, only one.
    console . log ( calculatedProduct * ( ( firstCount === secondCount ) + 1 ) % primeDivisor ) ;
} ;

processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;